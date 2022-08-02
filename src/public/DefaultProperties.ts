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
import { DataMapper } from '../view/fields/DataMapper.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { BasicProperties } from '../view/fields/BasicProperties.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';


export class DefaultProperties extends BasicProperties
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

	public apply() : void
	{
		FieldFeatureFactory.merge(this,this.inst$,this.status == null);
	}
}
