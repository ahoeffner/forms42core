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
import { FieldInstance } from "./fields/FieldInstance.js";
import { Form as InterfaceForm } from '../public/Form.js';
import { EventType } from "../control/events/EventType.js";
import { Block as InterfaceBlock } from '../public/Block.js';
import { FieldState } from "./fields/interfaces/FieldImplementation.js";
import { FormEvent, FormEvents } from "../control/events/FormEvents.js";


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
		let fld:Field = this.getRow(this.row)?.getField(field);
		if (fld == null) fld = this.getRow(-1)?.getField(field);
		return(fld);
	}

	public getFields() : Field[]
	{
		let row:Row = null;
		let fields:Field[] = [];

		row = this.getRow(this.row);
		if (row != null) fields.push(...row.getFields());

		row = this.getRow(-1);
		if (row != null) fields.push(...row.getFields());

		return(fields);
	}

	public getFieldInstances() : FieldInstance[]
	{
		let row:Row = null;
		let instances:FieldInstance[] = [];

		row = this.getRow(this.row);
		if (row != null) instances.push(...row.getFieldInstances());

		row = this.getRow(-1);
		if (row != null) instances.push(...row.getFieldInstances());

		return(instances);
	}

	public getValue(field:string) : any
	{
		return(this.rows$.get(this.row).getField(field)?.getValue());
	}

	public getFieldNames() : string[]
	{
		return(this.fieldnames$);
	}

	public setEventTransaction(event:EventType, offset:number) : void
	{
		this.model.setEventTransaction(event,offset);
	}

	public endEventTransaction(apply:boolean) : void
	{
		this.model.endEventTransaction(apply);
	}

	public async validate(inst?:FieldInstance, value?:any) : Promise<boolean>
	{
		if (inst == null)
		{
			return(this.getRow(this.row).validate());
		}
		else
		{
			this.setEventTransaction(EventType.ValidateField,0);
			let success:boolean = await this.fireFieldEvent(EventType.ValidateField,inst);
			this.endEventTransaction(success);

			if (success)
				this.mdlblk.setValue(inst.name,value);

			return(success);
		}
	}

	public get validated() : boolean
	{
		return(this.getRow(this.row).validated);
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

	public async onKey(inst:FieldInstance, key:KeyMap) : Promise<boolean>
	{
		return(this.fireKeyEvent(inst,key));
	}

	public async onEditing(inst:FieldInstance) : Promise<boolean>
	{
		this.setEventTransaction(EventType.Editing,0);
		let success:boolean = await	this.fireFieldEvent(EventType.Editing,inst);
		this.endEventTransaction(success);
		return(success);
	}

	public async navigate(key:KeyMap, inst:FieldInstance) : Promise<FieldInstance>
	{
		let next:FieldInstance = inst;

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
				next = await this.scroll(inst,1);
				break;
			}

			case KeyMap.prevrecord :
			{
				next = await this.scroll(inst,-1);
				break;
			}
		}

		if (next != inst)
			inst.blur();

		next.focus();
		return(next);
	}

	public offset(inst:FieldInstance) : number
	{
		let row:number = inst.row;
		if (row < 0) row = this.row;
		return(row-this.row$);
	}

	public getCurrentRow() : Row
	{
		return(this.rows$.get(this.row));
	}

	public setCurrentRow(rownum:number) : void
	{
		if (this.row$ < 0)
		{
			this.row$ = 0;

			if (rownum > 0)
				this.row$ = rownum;

			this.openrow();
			this.displaycurrent();
			this.model.queryDetails();

			return;
		}

		if (rownum == this.row || rownum == -1)
			return;

		this.mdlblk.move(rownum-this.row);

		// disable autofill
		this.getRow(this.row).setFieldState(FieldState.READONLY);
		this.row$ = rownum;

		this.openrow();
		this.displaycurrent();
		this.model.queryDetails();
	}

	public addRow(row:Row) : void
	{
		this.rows$.set(row.rownum,row);
	}

	public getRow(rownum:number) : Row
	{
		return(this.rows$.get(rownum));
	}

	public display(rownum:number, record:Record) : void
	{
		let row:Row = this.getRow(rownum);

		if (row.getFieldState() == FieldState.DISABLED)
			row.setFieldState(FieldState.READONLY);

		row.clear();

		record.values.forEach((field) =>
		{row.distribute(field.name,field.value,true);})
	}

	public refresh(rownum:number, record:Record) : void
	{
		this.display(rownum,record);
		if (rownum == this.row) this.displaycurrent();
	}

	private openrow()
	{
		let row:Row = this.getRow(this.row);
		let current:Row = this.rows$.get(-1);

		if (row.getFieldState() == FieldState.READONLY)
		{
			row.setFieldState(FieldState.OPEN);

			if (current != null)
			{
				if (current.getFieldState() == FieldState.READONLY)
					current.setFieldState(FieldState.OPEN);
			}
		}
	}

	private displaycurrent() : void
	{
		let current:Row = this.rows$.get(-1);

		if (current != null)
		{
			current.clear();
			let record:Record = this.mdlblk.getRecord();
			record.values.forEach((field) => {current.distribute(field.name,field.value,true)});
		}
	}

	private async scroll(inst:FieldInstance, offset:number) : Promise<FieldInstance>
	{
		let next:FieldInstance = inst;

		if (!await this.validate())
			return(next);

		if (this.row + offset < 0)
		{
			console.log("try fetc backwards");
			return(next);
		}

		if (this.row + offset >= this.rows)
		{
			console.log("try fetc forwards");
			return(next);
		}

		this.getCurrentRow().validate();
		let idx:number = inst.field.row.getFieldIndex(inst);

		if (inst.row < 0)
		{
			if (!await this.form.LeaveField(inst))
				return(next);

			if (!await this.form.leaveRecord(this))
				return(next);

			if (!await this.form.enterRecord(this,offset))
				return(next);

			if (!await this.form.enterField(inst,offset))
				return(next);

			this.setCurrentRow(this.row+offset);
		}
		else
		{
			next = this.getRow(this.row+offset).getFieldByIndex(idx);
		}

		return(next);
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

	public distribute(field:Field, value:any, valid:boolean) : void
	{
		let cr:number = this.row$;
		let fr:number = field.row.rownum;

		if (fr >= 0) this.getRow(-1)?.distribute(field.name,value,valid);
		else		 this.getRow(cr)?.distribute(field.name,value,valid);
	}

	public linkModel() : void
	{
		this.mdlblk = ModelForm.getForm(this.form.parent).getBlock(this.name);
	}

	public dumpInstances() : void
	{
		this.getFields().forEach((field) =>
		{
			console.log(field.name+"["+field.row.rownum+"] dirty: "+field.dirty);
		})

		this.getFieldInstances().forEach((inst) =>
		{
			let value:any = inst.getValue();
			if (value == null) console.log(inst.name+" "+null);
			else console.log(inst.name+" "+value+" "+value.constructor.name);
		});
	}

	private async fireKeyEvent(inst:FieldInstance, key:KeyMap) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.KeyEvent(this.form.parent,inst,key);
		return(FormEvents.raise(frmevent));
	}

	private async fireFieldEvent(type:EventType, inst:FieldInstance) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.FieldEvent(type,inst);
		return(FormEvents.raise(frmevent));
	}
}
