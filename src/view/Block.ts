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

import { Row } from "./Row.js";
import { Form } from "./Form.js";
import { Field } from "./fields/Field.js";
import { KeyMap } from "../events/KeyMap.js";
import { Form as ModelForm } from '../model/Form.js';
import { Form as Interface } from '../public/Form.js';
import { Block as ModelBlock } from '../model/Block.js';
import { FieldInstance } from "./fields/FieldInstance.js";


export class Block
{
	private row:number = 0;
	private form$:Form = null;
	private name$:string = null;
	private mdlblk:ModelBlock = null;
	private currfld:FieldInstance = null;
	private rows:Map<number,Row> = new Map<number,Row>();

	constructor(form:Interface,name:string)
	{
		if (name == null)
			name = "";

		this.name$ = name;
		this.form$ = Form.getForm(form);
		ModelBlock.create(Form.getForm(form),this);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get validated() : boolean
	{
		if (this.currfld == null) return(true);
		return(this.getRow(this.currfld.row).validated);
	}

	public getFieldValue(field:string) : any
	{
		return(this.getRow(this.row).getField(field)?.getValue());
	}

	public navigate(key:KeyMap, inst:FieldInstance) : void
	{
		let next:FieldInstance = null;

		switch(key)
		{
			case KeyMap.nextfield :
			{
				next = inst.field.row.nextField(inst)
				break;
			}
		}

		if (next != null)
			next.focus();
	}

	public async validate() : Promise<boolean>
	{
		if (!this.getRow(this.row).validated)
		{
			if (!this.getRow(this.row).validateFields())
				return(false);

			if (!await this.mdlblk.validateRecord())
				return(false);
		}

		return(true);
	}

	public getCurrentRow() : Row
	{
		return(this.rows.get(this.row));
	}

	public async setCurrentField(inst:FieldInstance) : Promise<boolean>
	{
		// Navigate to current block
		let move:boolean = await this.form.setCurrentBlock(inst.block);

		if (!move)
		{
			this.currfld.focus();
			return(false);
		}

		// Navigate to current row
		move = await this.setCurrentRow(inst.row);

		if (!move)
		{
			this.currfld.focus();
			return(false);
		}

		this.currfld = inst;
	}

	public async setCurrentRow(rownum:number) : Promise<boolean>
	{
		if (rownum == this.row || rownum == -1)
			return(true);

		if (!await this.validate())
			return(false);

		if (!await this.mdlblk.setCurrentRecord(rownum-this.row))
			return(false);

		this.row = rownum;
		let current:Row = this.rows.get(-1);

		if (current != null)
		{
			console.log("distribute all !!")
			this.rows.get(this.row).getFields().forEach((fld) =>
			{current.distribute(fld,fld.getStringValue())});
		}

		return(true);
	}

	public addRow(row:Row) : void
	{
		this.rows.set(row.rownum,row);
	}

	public getRow(rownum:number) : Row
	{
		return(this.rows.get(rownum));
	}

	public linkModel() : void
	{
		this.mdlblk = ModelForm.getForm(this.form.parent).getBlock(this.name);
	}

	public finalize() : void
	{
		let rows:Row[] = [];

		this.rows.forEach((row) => {rows.push(row)});

		if (rows.length == 1)
			rows[0].rownum = 0;

		if (rows.length > 1)
		{
			let n:number = 0;
			rows = rows.sort((r1,r2) => {return(r1.rownum - r2.rownum)});

			for (let i = 0; i < rows.length; i++)
			{
				if (rows[i].rownum < 0)
					continue;

				rows[i].rownum = n++;
			}
		}

		this.rows.clear();
		rows.forEach((row) => {this.rows.set(row.rownum,row)});
	}

	public distribute(field:Field, value:string) : void
	{
		let cr:number = this.row;
		let fr:number = field.row.rownum;

		if (fr >= 0) this.getRow(-1).distribute(field,value);
		else		 this.getRow(cr).distribute(field,value);
	}
}
