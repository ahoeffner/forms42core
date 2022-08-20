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
import { EventStack } from "./EventStack.js";
import { BrowserEvent} from "../BrowserEvent.js";
import { FieldInstance } from "./FieldInstance.js";
import { Form as Interface } from "../../public/Form.js";
import { Block as ModelBlock } from "../../model/Block.js";
import { KeyMap, KeyMapping } from "../../control/events/KeyMap.js";
import { MouseMap, MouseMapParser} from "../../control/events/MouseMap.js";


export class Field
{
	private row$:Row = null;
	private value$:any = null;
	private name$:string = null;
	private block$:Block = null;
	private valid$:boolean = true;
	private dirty$:boolean = false;
	private instance$:FieldInstance = null;
	private instances$:FieldInstance[] = [];

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

	public get dirty() : boolean
	{
		return(this.dirty$);
	}

	public set dirty(flag:boolean)
	{
		this.dirty$ = flag;
	}

	public get mdlblock() : ModelBlock
	{
		return(this.block$.model);
	}

	public get valid() : boolean
	{
		// Though valid, check required
		if (this.valid$ && this.value$ == null)
		{
			let valid:boolean = true;

			this.instances$.forEach((inst) =>
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

	public clear() : void
	{
		this.valid = true;
		this.dirty = false;
		this.value$ = null;
		this.instances$.forEach((inst) => {inst.clear()});
	}

	public addInstance(instance:FieldInstance) : void
	{
		this.instances$.push(instance);
		this.row.addInstance(instance);
		this.block.addInstance(instance);
	}

	public getInstance(entry:number) : FieldInstance
	{
		return(this.instances$[entry]);
	}

	public getInstances() : FieldInstance[]
	{
		return(this.instances$);
	}

	public getInstanceEntry(inst:FieldInstance) : number
	{
		for (let i = 0; i < this.instances$.length; i++)
		{
			if (inst == this.instances$[i])
				return(i);
		}

		return(-1);
	}

	public getInstancesById(id:string) : FieldInstance[]
	{
		if (id == null) return([]);
		let instances:FieldInstance[] = [];

		id = id.toLowerCase();

		this.instances$.forEach((inst) =>
		{
			if (inst.properties.id == id)
				instances.push(inst);
		});

		return(instances)
	}

	public getInstancesByClass(clazz:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		if (clazz == null)
		{
			this.instances$.forEach((inst) =>
			{instances.push(inst);});
		}

		else

		{
			this.instances$.forEach((inst) =>
			{
				if (inst.properties.hasClass(clazz))
					instances.push(inst);
			});
		}

		return(instances)
	}

	public setValue(value:any) : void
	{
		this.distribute(null,value,false);
		this.block.distribute(this,this.value$,this.dirty);
	}

	public getValue() : any
	{
		if (!this.dirty) return(this.value$);

		let inst:FieldInstance = this.instance$;
		if (inst == null) inst = this.instances$[0];

		return(inst.getIntermediateValue());
	}

	public async handleEvent(inst:FieldInstance, brwevent:BrowserEvent) : Promise<void>
	{
		return(await EventStack.stack(this,inst,brwevent));
	}

	public async performEvent(inst:FieldInstance, brwevent:BrowserEvent) : Promise<void>
	{
		let key:KeyMap = null;

		if (brwevent.type == "focus")
		{
			this.instance$ = inst;
			this.value$ = inst.getValue();

			if (inst.ignore != "focus")
				await this.block.form.enter(inst);

			inst.ignore = null;
			return;
		}

		if (brwevent.type == "blur")
		{
			if (inst.ignore != "blur")
				await this.block.form.leave(inst);

			if (!this.valid$)
				inst.valid = false;

			inst.ignore = null;
			return;
		}

		if (brwevent.type == "change")
		{
			this.row.invalidate();
			await this.validate(inst);

			this.distribute(inst,this.value$,this.dirty);
			this.block.distribute(this,this.value$,this.dirty);
			return;
		}

		if (brwevent.modified)
		{
			let value:string = inst.getIntermediateValue();

			this.dirty = true;
			inst.valid = true;
			this.valid = false;
			this.row.invalidate();
			this.row.changestate();

			this.distribute(inst,value,this.dirty);
			this.block.distribute(this,value,this.dirty);

			await this.block.onTyping(inst);
			return;
		}

		if (brwevent.onScrollUp) {key = KeyMap.nextrecord; inst = this.block.form.instance;}
		if (brwevent.onScrollDown) {key = KeyMap.prevrecord; inst = this.block.form.instance;}

		if (brwevent.type.startsWith("key") || key != null)
		{
			if (brwevent.undo) key = KeyMap.undo;
			else if (brwevent.copy) key = KeyMap.copy;
			else if (brwevent.paste) key = KeyMap.paste;

			if (key == null)
				key = KeyMapping.parseBrowserEvent(brwevent);

			this.block.form.keyhandler(key,inst);
			return;
		}

		if (brwevent.isMouseEvent)
		{
			let mevent:MouseMap = MouseMapParser.parseBrowserEvent(brwevent);
			await this.block.onMouse(inst,mevent);
			return;
		}
	}

	public distribute(inst:FieldInstance, value:any, dirty:boolean) : void
	{
		this.dirty = dirty;
		this.value$ = value;

		if (dirty)
		{
			if (value != null)
				this.valid$ = false;
		}
		else
		{
			this.valid$ = true;
		}

		this.instances$.forEach((fi) =>
		{
			if (fi != inst)
			{
				if (!dirty) fi.setValue(value);
				else fi.setIntermediateValue(value);
			}
		});
	}

	public async validate(inst:FieldInstance) : Promise<boolean>
	{
		let value:any = inst.getValue();

		if (value != this.value$)
			this.dirty = true;

		if (!this.dirty)
			return(true);

		if (!await this.block.validateField(inst,inst.getValue()))
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
			this.dirty = false;
			this.value$ = value;

			return(true);
		}
	}

	public toString() : string
	{
		return(this.name+"["+this.row.rownum+"] value: "+this.value$+" dirty: "+this.dirty+" valid: "+this.valid$);
	}
}