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
import { Record } from "../model/Record.js";
import { KeyMap } from "../control/events/KeyMap.js";
import { Form as ModelForm } from '../model/Form.js';
import { FieldProperties } from "./FieldProperties.js";
import { Block as ModelBlock } from '../model/Block.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { FieldInstance } from "./fields/FieldInstance.js";
import { Block as InterfaceBlock } from '../public/Block.js';
import { FieldState } from "./fields/interfaces/FieldImplementation.js";


export class Block
{
	private rc$:number = -1;
	private row$:number = -1;
	private form$:Form = null;
	private name$:string = null;
	private mdlblk:ModelBlock = null;
	private fieldnames$:string[] = null;
	private rows$:Map<number,Row> = new Map<number,Row>();
	private properties:FieldProperties = new FieldProperties();

	public static getBlock(block:InterfaceBlock) : Block
	{
		return(Form.getForm(block.form).getBlock(block.name));
	}

	constructor(form:InterfaceForm,name:string)
	{
		if (name == null)
			name = "";

		this.name$ = name;
		this.fieldnames$ = [];
		this.form$ = Form.getForm(form);
		ModelBlock.create(Form.getForm(form),this);
	}

	public get row() : number
	{
		if (this.row$ < 0) return(0);
		else               return(this.row$);
	}

	public get rows() : number
	{
		return(this.rc$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get model() : ModelBlock
	{
		return(this.mdlblk);
	}

	public getField(field:string) : Field
	{
		return(this.getRow(this.row)?.getField(field));
	}

	public getValue(field:string) : any
	{
		return(this.rows$.get(this.row).getField(field)?.getValue());
	}

	public getFieldNames() : string[]
	{
		return(this.fieldnames$);
	}

	public get validated() : boolean
	{
		return(this.getRow(this.row).validated);
	}

	public async validateRow() : Promise<boolean>
	{
		return(this.getRow(this.row).validate());
	}

	public clear() : boolean
	{
		if (!this.validated)
			return(false);

		this.properties.clear();
		this.rows$.forEach((row) => {row.clear()});

		return(true);
	}

	public addInstance(inst:FieldInstance) : void
	{
		this.properties.setDefault(inst,inst.properties);

		if (this.fieldnames$.indexOf(inst.name) < 0)
			this.fieldnames$.push(inst.name);
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

			case KeyMap.prevfield :
			{
				next = inst.field.row.prevField(inst)
				break;
			}

			case KeyMap.nextrecord :
			{
				if (this.validated)
					next = this.getCurrentRow().prevField(inst)
				break;
			}
		}

		if (next != null)
			next.focus();
	}

	public offset(inst:FieldInstance) : number
	{
		return(inst.row-this.row$);
	}

	public getCurrentRow() : Row
	{
		return(this.rows$.get(this.row));
	}

	public async setCurrentRow(rownum:number) : Promise<boolean>
	{
		if (this.row$ < 0)
		{
			this.row$ = 0;

			if (rownum > 0)
				this.row$ = rownum;

			if (!await this.mdlblk.setCurrentRecord(this.row$))
			{
				this.row$ = -1;
				return(false);
			}

			this.openrow(this.row$);
			return(true);
		}

		if (rownum == this.row$ || rownum == -1)
			return(true);

		if (!await this.validateRow())
			return(false);

		if (!await this.mdlblk.setCurrentRecord(rownum-this.row$))
			return(false);

		// disable autofill
		this.getRow(this.row$).setFieldState(FieldState.READONLY);

		this.row$ = rownum;
		this.openrow(this.row$);

		return(true);
	}

	public addRow(row:Row) : void
	{
		this.rows$.set(row.rownum,row);
	}

	public getRow(rownum:number) : Row
	{
		return(this.rows$.get(rownum));
	}

	private openrow(rownum:number)
	{
		let row:Row = this.getRow(rownum);
		let current:Row = this.rows$.get(-1);

		if (row.getFieldState() == FieldState.READONLY)
		{
			row.setFieldState(FieldState.OPEN);

			if (current != null)
			{
				if (current.getFieldState() == FieldState.READONLY)
					current.setFieldState(FieldState.OPEN);

				this.displaycurrent(rownum);
			}
		}
	}

	public display(rownum:number, record:Record) : void
	{
		let row:Row = this.getRow(rownum);

		if (row.getFieldState() == FieldState.DISABLED)
			row.setFieldState(FieldState.READONLY);

		row.clear();

		record.values.forEach((field) =>
		{row.distribute(field.name,field.value);})
	}

	public displaycurrent(rownum:number) : void
	{
		let current:Row = this.rows$.get(-1);

		if (current != null)
		{
			current.clear();
			let rec:Record = this.mdlblk.getRecord(rownum-this.row);
			rec.values.forEach((field) => {current.distribute(field.name,field.value)});
		}
	}

	public finalize() : void
	{
		let rows:Row[] = [];
		this.rows$.forEach((row) => {rows.push(row)});

		/*
		 * If only 1 row, set rownum to 0;
		 * Otherwise sort all rows and re-number then from 0 - rows
		*/

		if (rows.length == 1)
			rows[0].rownum = 0;

		if (rows.length > 1)
		{
			let n:number = 0;
			rows = rows.sort((r1,r2) => {return(r1.rownum - r2.rownum)});

			for (let i = 0; i < rows.length; i++)
			{
				if (rows[i].rownum >= 0)
					rows[i].rownum = n++;
			}
		}

		this.rows$.clear();

		rows.forEach((row) =>
		{this.rows$.set(row.rownum,row)});

		this.rc$ = rows.length;
		if (this.getRow(-1) != null) this.rc$--;

		this.rows$.forEach((row) =>
		{
			row.initialize();

			if (row.rownum > 0)
				row.setFieldState(FieldState.DISABLED);
		});

		this.getRow(0)?.setFieldState(FieldState.READONLY);
		this.getRow(-1)?.setFieldState(FieldState.READONLY);
	}

	public distribute(field:Field, value:any) : void
	{
		let cr:number = this.row$;
		let fr:number = field.row.rownum;

		if (fr >= 0) this.getRow(-1)?.distribute(field.name,value);
		else		 this.getRow(cr)?.distribute(field.name,value);
	}

	public linkModel() : void
	{
		this.mdlblk = ModelForm.getForm(this.form.parent).getBlock(this.name);
	}
}
