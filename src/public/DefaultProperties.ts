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
import { Status } from '../view/Row.js';
import { Class } from '../types/Class.js';
import { Properties } from './Properties.js';
import { DataMapper } from '../view/fields/DataMapper.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { BasicProperties } from '../view/fields/BasicProperties.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';


export class DefaultProperties extends BasicProperties implements Properties
{
	private status:Status = null;
	private inst$:FieldInstance = null;

	constructor(inst$:FieldInstance, status:Status)
	{
		super();
		this.inst$ = inst$;
		this.status = status;
		FieldFeatureFactory.initialize(this,inst$,true,status);
	}

	public get id() : string
	{
		return(this.inst$.id);
	}

	public get name() : string
	{
		return(this.inst$.name);
	}

	public get block() : string
	{
		return(this.inst$.block);
	}

	public get row() : number
	{
		if (this.inst$.row < 0) return(null);
		else 					return(this.inst$.row);
	}

	public get form() : Form
	{
		return(this.inst$.form);
	}

	public setTag(tag:string) : DefaultProperties
	{
		this.tag = tag;
		return(this);
	}

	public setEnabled(flag:boolean) : DefaultProperties
	{
		this.enabled = flag;
		return(this);
	}

	public setReadOnly(flag:boolean) : DefaultProperties
	{
		this.readonly = flag;
		return(this);
	}

	public setRequired(flag:boolean) : DefaultProperties
	{
		this.required = flag;
		return(this);
	}

	public setHidden(flag:boolean) : DefaultProperties
	{
		this.hidden = flag;
		return(this);
	}

	public setStyles(styles:string) : DefaultProperties
	{
		super.setStyles(styles);
		return(this);
	}

	public setStyle(style:string, value:string) : DefaultProperties
	{
		super.setStyle(style,value);
		return(this);
	}

	public removeStyle(style:string) : DefaultProperties
	{
		super.removeStyle(style);
		return(this);
	}

	public setClass(clazz:any) : DefaultProperties
	{
		super.setClass(clazz);
		return(this);
	}

	public removeClass(clazz:any) : DefaultProperties
	{
		super.removeClass(clazz);
		return(this);
	}

	public setClasses(classes:string|string[]) : DefaultProperties
	{
		super.setClasses(classes);
		return(this);
	}

	public setAttribute(attr:string, value:any) : DefaultProperties
	{
		super.setAttribute(attr,value);
		return(this);
	}

	public removeAttribute(attr:string) : DefaultProperties
	{
		super.removeAttribute(attr);
		return(this);
	}

	public setValue(value:string) : DefaultProperties
	{
		this.value = value;
		return(this);
	}

	public setValidValues(values: Set<string> | Map<string,string>) : DefaultProperties
	{
		this.validValues = values;
		return(this);
	}

	public setMapper(mapper:Class<DataMapper>|DataMapper|string) : DefaultProperties
	{
		super.setMapper(mapper);
		return(this);
	}

	public apply() : void
	{
		FieldFeatureFactory.merge(this,this.inst$,this.status == null);
	}
}
