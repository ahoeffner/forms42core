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

import { Field } from "../fields/Field.js";


export class Row
{
	private fields:Map<string,Field> = new Map<string,Field>();

	public add(field:Field) : void
	{
		let fld:Field = this.fields.get(field.name);

		if (fld == null)
		{
			fld = new Field(field.name);
			this.fields.set(field.name,fld);
		}
	}

	public getField(name:string, create:boolean) : Field
	{
		name = name.toLowerCase();
		let field:Field = this.fields.get(name);
		if (field == null && create) field = new Field(name);
		return(field);
	}

/*
	public getAll() : Field[]
	{
		let fields:Field[] = [];

		this.groups.forEach((flds) =>
		{fields.push(...flds)});

		return(fields);
	}


	public getByName(name:string, id?:string) : FieldInstance[]
	{
		let fields:FieldInstance[] = this.groups.get(name.toLowerCase());
		if (fields == null) return([]);

		if (id != null)
		{
			id = id.toLowerCase();
			let ids:FieldInstance[] = [];
			fields.forEach((fld) =>
			{
				if (fld.id == id)
					ids.push(fld);
			});

			fields = ids;
		}

		return(fields);
	}


	public getByClass(name:string, clazz:string) : FieldInstance[]
	{
		let fields:FieldInstance[] = this.groups.get(name.toLowerCase());
		if (fields == null) return([]);

		let classes:FieldInstance[] = [];

		fields.forEach((fld) =>
		{
			if (fld.properties.hasClass(clazz))
				classes.push(fld);
		});

		return(classes);
	}
	*/
}