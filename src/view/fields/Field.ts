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
import { BrowserEvent as Event} from "./BrowserEvent.js";


export class Field
{
	private row$:Row = null;
	private value$:any = null;
	private name$:string = null;
	private block$:Block = null;
	private valid$:boolean = true;
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
		return(this.distribute(null,value));
	}

	public getValue() : any
	{
		return(this.instances[0].getValue());
	}

	public getStringValue() : string
	{
		return(this.instances[0].getStringValue());
	}

	public handleEvent(inst:FieldInstance, event:Event) : void
	{
		if (event.type == "focus")
		{
			this.block.setCurrentRow(this.row.rownum);
			this.value$ = this.instances[0].getValue();
		}

		if (event.type == "change" || event.type == "blur")
		{
			if (this.value$ != this.instances[0].getValue())
			{
				this.valid$ = this.instances[0].validate();
				this.value$ = this.instances[0].getValue();
			}
		}

		if (event.modified)
		{
			this.distribute(inst,inst.getStringValue());
			this.block.distribute(this,inst.getStringValue());
		}
	}

	public distribute(inst:FieldInstance, value:string) : boolean
	{
		let errors:boolean = false;

		this.instances.forEach((fi) =>
		{
			if (fi != inst)
			{
				if (!fi.setValue(value))
					errors = true;
			}
		});

		return(errors);
	}
}