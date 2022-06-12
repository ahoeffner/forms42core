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
	private currfld:FieldInstance = null;
	private rows$:Map<number,Row> = new Map<number,Row>();
	private values:Map<number,Map<string,any>> = new Map<number,Map<string,any>>(); // All values, row + current

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

	public getFieldNames() : string[]
	{
		return(this.fieldnames$);
	}

	public get validated() : boolean
	{
		if (this.currfld == null) return(true);
		return(this.getRow(this.row).validated);
	}

	public addInstance(inst:FieldInstance) : void
	{
		let values:Map<string,any> = this.values.get(inst.row);

		if (values == null)
		{
			values = new Map<string,any>();
			this.values.set(inst.row,values);
		}

		values.set(inst.name,null);

		if (this.fieldnames$.indexOf(inst.name) < 0)
			this.fieldnames$.push(inst.name);
	}

	public setFieldValue(inst:string|FieldInstance, value:any) : boolean
	{
		let values:Map<string,any> = this.values.get(this.row);

		if (values == null)
		{
			values = new Map<string,any>();
			this.values.set(this.row,values);
		}

		if (typeof inst === "string")
		{
			inst = this.getField(inst)?.getInstance(0);
			if (inst == null) return(false);
		}

		values.set(inst.name,value);
		return(true);
	}

	public getValue(field:string) : any
	{
		return(this.rows$.get(this.row).getField(field)?.getValue());
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
		return(this.rows$.get(this.row));
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
		return(true);
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

			this.openrow(0);
			return(true);
		}

		if (rownum == this.row$ || rownum == -1)
			return(true);

		if (!await this.validate())
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

		record.values.forEach((col) =>
		{
			if (this.setFieldValue(col.name,col.value))
				this.getRow(rownum).distribute(col.name,col.value);
		})
	}

	public displaycurrent(rownum:number) : void
	{
		let current:Row = this.rows$.get(-1);

		if (current != null)
			this.values.get(rownum)?.forEach((val,fld) => {current.distribute(fld,val)});
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
		{
			let fields:Map<string,any> = this.values.get(rows[0].rownum);
			this.values.delete(rows[0].rownum);
			this.values.set(0,fields);
			rows[0].rownum = 0;
		}

		if (rows.length > 1)
		{
			let n:number = 0;
			rows = rows.sort((r1,r2) => {return(r1.rownum - r2.rownum)});

			for (let i = 0; i < rows.length; i++)
			{
				if (rows[i].rownum < 0)
					continue;

				let fields:Map<string,any> = this.values.get(rows[i].rownum);
				this.values.delete(rows[i].rownum);
				this.values.set(n,fields);

				rows[i].rownum = n++;
			}
		}

		this.rows$.clear();

		rows.forEach((row) =>
		{this.rows$.set(row.rownum,row)});

		this.rc$ = rows.length;
		let current:Map<string,any> = this.values.get(-1);

		if (current != null)
		{
			this.rc$--;

			let cflds:string[] = [];
			let rows:Map<string,any>[] = [];

			this.values.forEach((map,rownum) =>
			{if (rownum >= 0) rows.push(map)});

			current.forEach((_val,fld) =>
			{cflds.push(fld);});

			rows.forEach((map) =>
			{
				cflds.forEach((fld) =>
				{map.set(fld,null)});
			})
		}

		this.values.delete(-1);

		this.getRow(0)?.setFieldState(FieldState.READONLY);
		this.getRow(-1)?.setFieldState(FieldState.READONLY);

		this.rows$.forEach((row) =>
		{if (row.rownum > 0) row.setFieldState(FieldState.DISABLED)});

		if (this.rows$.size > 1)
			this.rows$.forEach((row) =>	{row.setBlockAndRow()});
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
