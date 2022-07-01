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

import { FieldInstance } from './FieldInstance.js';
import { Field as ViewField } from '../view/fields/Field.js';

export class Field
{
	constructor(private fields$:ViewField[]) {}

	public get name() : string
	{
		return(this.fields$[0].name);
	}

	public getInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.fields$.forEach((field) =>
		{
			field.getInstances().forEach((inst) =>
			{instances.push(new FieldInstance(inst))});
		})

		return(instances);
	}

	public getInstancesByName(name:string) : FieldInstance[]
	{
		name = name.toLowerCase();
		let instances:FieldInstance[] = [];

		this.fields$.forEach((field) =>
		{
			field.getInstances().forEach((inst) =>
			{
				if (inst.name == name)
					instances.push(new FieldInstance(inst));
			});
		})

		return(instances);
	}

	public getInstancesByClass(clazz:string) : FieldInstance[]
	{
		clazz = clazz?.toLowerCase();
		let instances:FieldInstance[] = [];

		this.fields$.forEach((field) =>
		{
			field.getInstancesByClass(clazz).forEach((inst) =>
			{instances.push(new FieldInstance(inst));});
		})

		return(instances);
	}

	public getValue() : any
	{
		return(this.fields$[0].getValue());
	}

	public setValue(value:any) : void
	{
		this.fields$[0].setValue(value);
		this.fields$[0].block.model.setValue(this.fields$[0].name,value);
	}
}