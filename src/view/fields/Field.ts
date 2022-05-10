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
import { Form as Interface } from "../../public/Form.js";
import { BrowserEventParser as Event} from "./BrowserEventParser.js";


export class Field
{
	private name$:string = null;
	private instances:FieldInstance[] = [];

	public static create(form:Interface, block:string, rownum:number, field:string) : Field
	{
		let frm:Form = Form.create(form);
		if (frm == null) return(null);

		let blk:Block = frm.get(block);

		if (blk == null)
		{
			blk = new Block(form,block);
			frm.addBlock(blk);
		}

		let row:Row = blk.getRow(rownum);

		if (row == null)
		{
			row = new Row(rownum);
			blk.addRow(row);
		}

		let fld:Field = row.getField(field);

		if (fld == null)
		{
			fld = new Field(field);
			row.addField(fld);
		}

		return(fld);
	}

	constructor(name:string)
	{
		this.name$ = name;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public add(instance:FieldInstance) : void
	{
		this.instances.push(instance);
	}

	public getInstances() : FieldInstance[]
	{
		return(this.instances);
	}

	public handleEvent(inst:FieldInstance, event:Event, value:any) : void
	{
		console.log(inst.name+"["+inst.row+"] "+event.type+" "+value);
	}
}