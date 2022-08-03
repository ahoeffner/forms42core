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

import { Form } from './Form.js';
import { Field } from './Field.js';
import { Record } from './Record.js';
import { Alert } from '../application/Alert.js';
import { Form as ModelForm } from '../model/Form.js';
import { Block as ViewBlock } from '../view/Block.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Record as ModelRecord } from '../model/Record.js';
import { EventType } from '../control/events/EventType.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';

export class Block
{
	private form$:Form = null;
	private name$:string = null;

	constructor(form:Form, name:string)
	{
		this.form$ = form;
		if (name == null) name = "";
		this.name$ = name.toLowerCase();
		ModelBlock.create(ModelForm.getForm(form),this);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public set datasource(source:DataSource)
	{
		ModelBlock.getBlock(this).datasource = source;
	}

	public getValue(field:string, dirty?:boolean) : any
	{
		return(this.getRecord(0)?.getValue(field,dirty));
	}

	public setValue(field:string, value:any) : void
	{
		this.getRecord(0)?.setValue(field,value);
	}

	public getRecord(offset?:number) : Record
	{
		let intrec:ModelRecord = null;
		if (offset == null) offset = 0;
		let block:ModelBlock = ModelBlock.getBlock(this);

		if (!ModelForm.getForm(this.form).hasEventTransaction(block))
		{
			intrec = block.getRecord(offset);
		}
		else
		{
			if (offset != 0)
			{
				let running:EventType = ModelForm.getForm(this.form).eventTransaction.getEvent(block);
				Alert.fatal("During transaction "+EventType[running]+" only current record can be accessed","Transaction Violation");
				return(null);
			}

			intrec = ModelForm.getForm(this.form).eventTransaction.getRecord(block);
		}

		return(intrec == null ? null : new Record(intrec));
	}

	public addKey(name:string, fields:string|string[]) : void
	{
		if (name == null) throw "@Block: Key name is madatory";
		if (fields == null) throw "@Block: Key fields is madatory";
		ModelBlock.getBlock(this).addKey(name,fields);
	}

	public removeKey(name:string) : boolean
	{
		return(ModelBlock.getBlock(this).removeKey(name));
	}

	public getFieldById(field:string, id:string) : Field
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = ViewBlock.getBlock(this).getFieldById(field,id);
		return(inst == null ? null : new Field(inst));
	}

	public getFields(field:string, clazz?:string) : Field[]
	{
		let fields:Field[] = [];

		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();

		ViewBlock.getBlock(this).getFieldsByClass(field,clazz)
		.forEach((inst) => {fields.push(new Field(inst))});

		return(fields);
	}

	public async executeQuery() : Promise<boolean>
	{
		return(ModelBlock.getBlock(this).executeQuery());
	}
}