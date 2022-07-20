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
import { FieldProperties } from './FieldProperties.js';
import { Block as ModelBlock } from '../model/Block.js';
import { DataSource } from '../model/interfaces/DataSource.js';

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
		return(this.form.getFieldById(this.name,field,id));
	}

	public getFields(field:string, clazz?:string) : Field[]
	{
		return(this.form.getFields(this.name,field,clazz));
	}

	public getDefaultProperties(field:string, clazz?:string) : FieldProperties[]
	{
		return(this.form.getDefaultProperties(this.name,field,clazz));
	}

	public getRecordProperties(field:string, clazz?:string) : FieldProperties[]
	{
		return(this.form.getRecordProperties(this.name,field,clazz));
	}

	public getValue(field:string) : any
	{
		return(this.form.getValue(this.name,field));
	}

	public setValue(field:string, value:any) : void
	{
		this.form.setValue(this.name,field,value);
	}

	public async executeQuery() : Promise<boolean>
	{
		return(ModelBlock.getBlock(this).executeQuery());
	}
}