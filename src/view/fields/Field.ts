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
import { FieldInstance } from "./FieldInstance.js";
import { EventType } from "../../events/EventType.js";
import { Form as Interface } from "../../public/Form.js";
import { BrowserEvent as Event} from "../BrowserEvent.js";
import { KeyMap, KeyMapping } from "../../events/KeyMap.js";
import { Event as FormEvent, Events } from "../../events/Events.js";
import { KeyCodes } from "../../events/KeyCodes.js";


export class Field
{
	private row$:Row = null;
	private name$:string = null;
	private block$:Block = null;
	private form$:Interface = null;
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
			fld = new Field(form,blk,row,field);
			row.addField(fld);
		}

		return(fld);
	}

	constructor(form:Interface, block:Block, row:Row, name:string)
	{
		this.row$ = row;
		this.name$ = name;
		this.form$ = form;
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

	public add(instance:FieldInstance) : void
	{
		this.instances.push(instance);
	}

	public getInstances() : FieldInstance[]
	{
		return(this.instances);
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

	public async handleEvent(inst:FieldInstance, event:Event)
	{
		let key:KeyMap = null;

		if (event.type == "focus")
		{
			if (await this.block.setCurrentRow(inst))
				await this.fire(EventType.PreField);
			return;
			}

		if (event.type == "blur")
		{
			await this.fire(EventType.PostField);
			return;
		}

		if (event.type == "change")
		{
			this.row.validated = false;

			if (!await this.fire(EventType.PostChange))
			{
				inst.setError(true);
				inst.focus();
			}

			return;
		}

		if (event.modified)
		{
			this.distribute(inst,inst.getStringValue());
			this.block.distribute(this,inst.getStringValue());
			return;
		}

		if (event.type.startsWith("key"))
		{
			if (event.ctrlkey != null || event.funckey != null)
			{
				if (event.undo) key = KeyMap.undo;
				else if (event.copy) key = KeyMap.copy;
				else if (event.paste) key = KeyMap.paste;
				else key = KeyMapping.parseBrowserEvent(event);

				this.fire(null,key);
				return;
			}
			else
			{
				key = KeyMapping.checkBrowserEvent(event);
				if (key != null) this.fire(null,key);
				console.log("key: "+key+" event: "+event);
				return;
			}
		}
	}

	public distribute(inst:FieldInstance, value:string) : void
	{
		this.instances.forEach((fi) =>
		{if (fi != inst) fi.setStringValue(value)});
	}

	private async fire(type:EventType, key?:KeyMap) : Promise<boolean>
	{
		let event:FormEvent = null;
		if (key != null) event = FormEvent.newKeyEvent(this.form$,key,this.block.name,this.name);
		else			 event = FormEvent.newFieldEvent(type,this.form$,this.block.name,this.name);
		return(Events.raise(event));
	}
}