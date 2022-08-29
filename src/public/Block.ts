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
import { Field } from '../view/fields/Field.js';
import { Alert } from '../application/Alert.js';
import { Block as ViewBlock } from '../view/Block.js';
import { FieldProperties } from './FieldProperties.js';
import { Filter } from '../model/interfaces/Filter.js';
import { Block as ModelBlock } from '../model/Block.js';
import { Record as ModelRecord } from '../model/Record.js';
import { EventType } from '../control/events/EventType.js';
import { FormBacking } from '../application/FormBacking.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';

export class Block
{
	private form$:Form = null;
	private name$:string = null;

	public qbeallowed:boolean = true;
	public queryallowed:boolean = true;
	public insertallowed:boolean = true;
	public updateallowed:boolean = true;
	public deleteallowed:boolean = true;

	constructor(form:Form, name:string)
	{
		this.form$ = form;
		this.name$ = name?.toLowerCase();
		form.blocks.set(this.name$,this);
		FormBacking.getModelBlock(this,true);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get filters() : Filter[]
	{
		return(FormBacking.getModelBlock(this).filters);
	}

	public focus() : void
	{
		setTimeout(() =>
		{
			ViewBlock.getBlock(this).focus();
		},0);
	}

	public goField(field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();

		let inst:FieldInstance = null;
		let ifield:Field = ViewBlock.getBlock(this).getCurrentRow().getField(field);

		if (ifield != null)
		{
			let instances:FieldInstance[] = ifield?.getInstancesByClass(clazz);
			if (instances.length > 0) inst = instances[0];
		}

		if (inst != null)
		{
			setTimeout(() =>
			{
				inst.focus();
			},0);
		}
	}

	public async getSourceData(header?:boolean, all?:boolean) : Promise<string[][]>
	{
		return(FormBacking.getModelBlock(this).copy(all,header));
	}

	public async saveDataToClipBoard(header?:boolean, all?:boolean) : Promise<void>
	{
		let str:string = "";
		let data:string[][] = await this.getSourceData(header,all);

		data.forEach((rec) =>
		{
			let row:string = "";
			rec.forEach((col) => {row += ", "+col})
			str += row.substring(2)+"\n";
		})

		str = str.substring(0,str.length-1);
		navigator.clipboard.writeText(str);
	}

	public get datasource() : DataSource
	{
		return(FormBacking.getModelBlock(this).datasource);
	}

	public set datasource(source:DataSource)
	{
		FormBacking.getModelBlock(this).datasource = source;
	}

	public async insert(before?:boolean) : Promise<boolean>
	{
		return(FormBacking.getModelBlock(this).insert(before));
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

		let block:ModelBlock = FormBacking.getModelBlock(this);

		if (!FormBacking.getModelForm(this.form).hasEventTransaction(block))
		{
			intrec = block.getRecord(offset);
		}
		else
		{
			if (offset != 0)
			{
				let running:EventType = FormBacking.getModelForm(this.form).eventTransaction.getEvent(block);
				Alert.fatal("During transaction "+EventType[running]+" only current record can be accessed","Transaction Violation");
				return(null);
			}

			intrec = FormBacking.getModelForm(this.form).eventTransaction.getRecord(block);
		}

		return(intrec == null ? null : new Record(intrec));
	}

	public addKey(name:string, fields:string|string[]) : void
	{
		if (name == null) throw "@Block: Key name is madatory";
		if (fields == null) throw "@Block: Key fields is madatory";
		FormBacking.getModelBlock(this).addKey(name,fields);
	}

	public removeKey(name:string) : boolean
	{
		return(FormBacking.getModelBlock(this).removeKey(name));
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
		return(FormBacking.getModelBlock(this).executeQuery(filters));
	}
}