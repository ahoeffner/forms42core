/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

import { Row } from "../Row.js";
import { Form } from "../Form.js";
import { Block } from "../Block.js";
import { BrowserEvent} from "../BrowserEvent.js";
import { FieldInstance } from "./FieldInstance.js";
import { Form as Interface } from "../../public/Form.js";
import { Block as ModelBlock } from "../../model/Block.js";
import { KeyMap, KeyMapping } from "../../control/events/KeyMap.js";
import { FormEvent, FormEvents } from "../../control/events/FormEvents.js";


export class Field
{
	private row$:Row = null;
	private value$:any = null;
	private name$:string = null;
	private block$:Block = null;
	private valid$:boolean = true;
	private instances:FieldInstance[] = [];

	public static create(form:Interface, block:string, field:string, rownum:number) : Field
	{
		let frm:Form = Form.getForm(form);
		if (frm == null) return(null);

		let blk:Block = frm.getBlock(block);

		if (blk == null)
		{
			blk = new Block(form,block);
			frm.addBlock(blk);
		}

		if (rownum < 0) rownum = -1;
		let row:Row = blk.getRow(rownum);

		if (row == null)
		{
			row = new Row(blk,rownum);
			blk.addRow(row);
		}

		let fld:Field = row.getField(field);

		if (fld == null)
		{
			fld = new Field(blk,row,field);
			row.addField(fld);
		}

		return(fld);
	}

	constructor(block:Block, row:Row, name:string)
	{
		this.row$ = row;
		this.name$ = name;
		this.block$ = block;
	}

	public get row() : Row
	{
		return(this.row$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public get mdlblock() : ModelBlock
	{
		return(this.block$.model);
	}

	public get valid() : boolean
	{
		// Though valid, check required
		if (this.valid$ && this.getValue() == null)
		{
			let valid:boolean = true;

			this.instances.forEach((inst) =>
			{
				if (inst.properties.required)
				{
					valid = false;
					inst.valid = false;
				}
			})

			if (!valid)	return(false);
		}

		return(this.valid$);
	}

	public set valid(flag:boolean)
	{
		this.valid$ = flag;
	}

	public addInstance(instance:FieldInstance) : void
	{
		this.instances.push(instance);
		this.row.addInstance(instance);
		this.block.addInstance(instance);
	}

	public getInstance(entry:number) : FieldInstance
	{
		return(this.instances[entry]);
	}

	public getInstances() : FieldInstance[]
	{
		return(this.instances);
	}

	public getInstanceEntry(inst:FieldInstance) : number
	{
		for (let i = 0; i < this.instances.length; i++)
		{
			if (inst == this.instances[i])
				return(i);
		}

		return(-1);
	}

	public getInstancesByClass(clazz:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.instances.forEach((inst) =>
		{
			if (inst.properties.hasClass(clazz))
				instances.push(inst);
		});

		return(instances)
	}

	public setValue(value:any) : void
	{
		this.distribute(null,value);
	}

	public getValue() : any
	{
		return(this.instances[0].getValue());
	}

	public getStringValue() : string
	{
		return(this.instances[0].getStringValue());
	}

	public async handleEvent(inst:FieldInstance, brwevent:BrowserEvent)
	{
		let key:KeyMap = null;

		if (brwevent.type == "focus")
		{
			this.value$ = inst.getValue();
			await this.block.form.enter(inst);
			return;
		}

		if (brwevent.type == "blur")
		{
			await this.block.form.leave(inst);
			return;
		}

		if (brwevent.accept)
		{
			if (!await this.validate(inst))
				return;

			if (!await this.block.validate())
				return;

			key = KeyMapping.checkBrowserEvent(brwevent);
			if (key != null) await this.block.onKey(inst,key);

			return;
		}

		if (brwevent.type == "change")
		{
			this.row.invalidate();
			this.distribute(inst,inst.getValue());
			this.block.distribute(this,inst.getValue());

			await this.validate(inst);
			return;
		}

		if (brwevent.modified)
		{
			inst.valid = true;
			let value:string = inst.getStringValue();

			this.row.invalidate();
			this.distribute(inst,value);
			this.block.distribute(this,value);

			await this.block.onEditing(inst);
			return;
		}

		if (brwevent.isMouseEvent)
		{
			let mevent:FormEvent = FormEvent.MouseEvent(this.block.form.parent, brwevent.event,inst);
			await FormEvents.raise(mevent);
			return;
		}

		if (brwevent.type.startsWith("key") && !brwevent.navigation)
		{
			if (brwevent.ctrlkey != null || brwevent.funckey != null)
			{
				if (brwevent.undo) key = KeyMap.undo;
				else if (brwevent.copy) key = KeyMap.copy;
				else if (brwevent.paste) key = KeyMap.paste;
				else key = KeyMapping.parseBrowserEvent(brwevent);

				if (key != null) await this.block.onKey(inst,key);
				return;
			}
			else
			{
				key = KeyMapping.checkBrowserEvent(brwevent);
				if (key != null) await this.block.onKey(inst,key);
				return;
			}
		}

		if (brwevent.navigation)
		{
			key = KeyMapping.parseBrowserEvent(brwevent);

			if (key != null)
			{
				if (await this.validate(inst))
					await this.block.navigate(key,inst);
			}

			return;
		}
	}

	public distribute(inst:FieldInstance, value:any) : void
	{
		this.instances.forEach((fi) =>
		{
			if (fi != inst)
			{
				if (typeof value === "string") fi.setStringValue(value)
				else fi.setValue(value);
			}
		});
	}

	private async validate(inst:FieldInstance) : Promise<boolean>
	{
		let value:any = inst.getValue();
		if (value == this.value$) return(true);

		if (!await this.block.validate(inst,value))
		{
			inst.focus();
			inst.valid = false;
			this.valid = false;
			return(false);
		}
		else
		{
			inst.valid = true;
			this.valid = true;
			this.value$ = value;
			return(true);
		}
	}
}