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
import { Form as Forms } from '../model/Form.js';
import { Block as ViewBlock } from '../view/Block.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Field as ViewField } from '../view/fields/Field';
import { DataSource } from '../model/interfaces/DataSource.js';
import { FieldInstance } from './FieldInstance.js';

export class Block
{
	private form$:Form = null;
	private name$:string = null;

	constructor(form:Form, name:string)
	{
		this.form$ = form;
		if (name == null) name = "";
		this.name$ = name.toLowerCase();
		ModelBlock.create(Forms.getForm(form),this);
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

	public addKey(name:string, fields:string|string[], primary?:boolean) : void
	{
		if (name == null) throw "@Block: Key name is madatory";
		if (fields == null) throw "@Block: Key fields is madatory";
		ModelBlock.getBlock(this).addKey(name,fields,primary);
	}

	public removeKey(name:string) : boolean
	{
		return(ModelBlock.getBlock(this).removeKey(name));
	}

	public getFields() : Field[]
	{
		return(this.form$.getFields(this.name$));
	}

	public getFieldInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((fld) =>
		{instances.push(...fld.getInstances());})

		return(instances);
	}

	public getFieldInstancesById(id:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((fld) =>
		{instances.push(...fld.getInstancesById(id));})

		return(instances);
	}

	public getFieldInstancesByName(name:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((fld) =>
		{instances.push(...fld.getInstancesByName(name));})

		return(instances);
	}

	public getFieldInstancesByClass(clazz:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((fld) =>
		{instances.push(...fld.getInstancesByClass(clazz));})

		return(instances);
	}

	public getValue(field:string) : any
	{
		return(this.form.getValue(this.name,field));
	}

	public setValue(field:string, value:any) : void
	{
		this.form.setValue(this.name,field,value);
	}
}