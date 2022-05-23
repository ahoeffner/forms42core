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


export class Field
{
	private row$:Row = null;
	private name$:string = null;
	private block$:Block = null;
	private valid$:boolean = true;
	private mdlblk:ModelBlock = null;
	private instances:FieldInstance[] = [];

	public static create(form:Interface, block:string, rownum:number, field:string) : Field
	{
		let frm:Form = Form.getForm(form);
		if (frm == null) return(null);

		let blk:Block = frm.getBlock(block);

		if (blk == null)
		{
			blk = new Block(form,block);
			frm.addBlock(blk);
		}

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

	public get valid() : boolean
	{
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
		this.block.form.addInstance(instance);
	}

	public reindexInstance(fr:HTMLElement, instance:FieldInstance) : void
	{
		this.block.form.reindexInstance(fr,instance);
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

	public setValue(value:any) : boolean
	{
		let status:boolean = this.instances[0].setValue(value);
		this.distribute(this.instances[0],this.instances[0].getStringValue());
		return(status);
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
		let event:Event = brwevent.event;

		if (this.mdlblk == null)
			this.mdlblk = this.block$.model;

		if (event.type == "focus")
		{
			if (await this.block.setCurrentField(inst))
				await this.mdlblk.preField(event);

			return;
		}

		if (event.type == "blur")
		{
			await this.mdlblk.postField(event);
			return;
		}

		if (event.type == "change")
		{
			this.row.validated = false;

			if (!await this.mdlblk.validateField(event))
			{
				inst.focus();
				inst.invalid(true);
				this.valid = false;
			}
			else
			{
				this.valid = true;
				this.block.setFieldValue(inst,inst.getValue());
			}

			return;
		}

		if (brwevent.modified)
		{
			this.distribute(inst,inst.getStringValue());
			this.block.distribute(this,inst.getStringValue());
			this.block.setFieldValue(inst,inst.getStringValue());
			await this.mdlblk.onEditing(event);
			return;
		}

		if (event.type.startsWith("key") && !brwevent.navigation)
		{
			if (brwevent.ctrlkey != null || brwevent.funckey != null)
			{
				if (brwevent.undo) key = KeyMap.undo;
				else if (brwevent.copy) key = KeyMap.copy;
				else if (brwevent.paste) key = KeyMap.paste;
				else key = KeyMapping.parseBrowserEvent(brwevent);

				await this.mdlblk.onKey(event,inst.name,key);
				return;
			}
			else
			{
				key = KeyMapping.checkBrowserEvent(brwevent);
				if (key != null) await this.mdlblk.onKey(event,inst.name,key);
				return;
			}
		}

		if (brwevent.navigation)
		{
			key = KeyMapping.parseBrowserEvent(brwevent);
			this.block.navigate(key,inst);
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
}