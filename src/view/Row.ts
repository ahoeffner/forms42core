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

import { Field } from "./fields/Field.js";
import { FieldInstance } from "./fields/FieldInstance.js";


export class Row
{
	public rownum:number = null;
	private fields:Map<string,Field> = new Map<string,Field>();

	constructor(rownum:number)
	{
		this.rownum = rownum;
	}

	public addField(field:Field) : void
	{
		let fld:Field = this.fields.get(field.name);

		if (fld == null)
		{
			fld = new Field(field.name);
			this.fields.set(field.name,fld);
		}
	}

	public getField(name:string) : Field
	{
		return(this.fields.get(name.toLowerCase()));
	}

	public getFields() : Field[]
	{
		let fields:Field[] = [];

		this.fields.forEach((fld) =>
		{fields.push(fld)});

		return(fields);
	}

	public getFieldInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.getFields().forEach((field) =>
		{instances.push(...field.getInstances());});

		return(instances);
	}

	public getInstancesByName(name:string, id?:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];
		let field:Field = this.getField(name);

		if (field != null)
		{
			if (id == null)
			{
				instances.push(...field.getInstances());
			}
			else
			{
				id = id.toLowerCase();
				field.getInstances().forEach((inst) =>
				{
					if (inst.id == id)
						instances.push(inst);
				});
			}
		}

		return(instances);
	}

	public getInstancesByClass(name:string, clazz:string) : FieldInstance[]
	{
		let instances:FieldInstance[] = [];
		let field:Field = this.getField(name);

		if (field != null)
		{
			field.getInstances().forEach((inst) =>
			{
				if (inst.properties.hasClass(clazz))
					instances.push(inst);
			});
		}

		return(instances);
	}
}