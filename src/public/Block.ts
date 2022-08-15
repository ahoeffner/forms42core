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
import { Record } from './Record.js';
import { Status } from '../view/Row.js';
import { Alert } from '../application/Alert.js';
import { Form as ModelForm } from '../model/Form.js';
import { Block as ViewBlock } from '../view/Block.js';
import { FieldProperties } from './FieldProperties.js';
import { Filter } from '../model/interfaces/Filter.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Record as ModelRecord } from '../model/Record.js';
import { EventType } from '../control/events/EventType.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';

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

	public async insert(before?:boolean) : Promise<boolean>
	{
		return(ModelBlock.getBlock(this).insert(before));
	}

	public getValue(field:string) : any
	{
		return(this.getRecord(0)?.getValue(field));
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

	public getQBEPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = ViewBlock.getBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.qbeProperties));
		return(null);
	}

	public getInsertPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = ViewBlock.getBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.insertProperties));
		return(null);
	}

	public getDefaultPropertiesById(field:string, id:string) : FieldProperties
	{
		id = id?.toLowerCase();
		field = field?.toLowerCase();
		let inst:FieldInstance = ViewBlock.getBlock(this).getFieldById(field,id);
		if (inst != null) return(new FieldProperties(inst.updateProperties));
		return(null);
	}

	public getQBEPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.qbeProperties))})
		return(props);
	}

	public getInsertPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.insertProperties))})
		return(props);
	}

	public getDefaultPropertiesByClass(field:string, clazz?:string) : FieldProperties[]
	{
		clazz = clazz?.toLowerCase();
		field = field?.toLowerCase();
		let props:FieldProperties[] = [];
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {props.push(new FieldProperties(inst.updateProperties))})
		return(props);
	}

	public setQBEProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.qbe);})
	}

	public setInsertProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.insert);})
	}

	public setDefaultProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		ViewBlock.getBlock(this).getFieldsByClass(field,clazz).
		forEach((inst) => {FieldFeatureFactory.replace(props,inst,Status.update);})
	}

	public async executeQuery(filters?:Filter|Filter[]) : Promise<boolean>
	{
		return(ModelBlock.getBlock(this).executeQuery(filters));
	}
}