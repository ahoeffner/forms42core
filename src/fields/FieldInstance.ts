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

import { Field } from "./Field.js";

class Row
{
	private fields:Map<string,Field[]> = new Map<string,Field[]>();
	private groups:Map<string,Map<string,Field[]>> = new Map<string,Map<string,Field[]>>();

	public add(field:Field) : void
	{
		this.fields = null;
		let ids:Map<string,Field[]> = this.groups.get(field.name);

		if (ids == null)
		{
			ids = new Map<string,Field[]>();
			this.groups.set(field.name,ids);
		}

		let fields:Field[] = ids.get(field.id);

		if (fields == null)
		{
			fields = [];
			ids.set(field.id,fields);
		}

		fields.push(field);
	}

	public get(name:string,id:string) : Field[]
	{
		let fields:Field[] = [];

		let ids:Map<string,Field[]> = this.groups.get(name.toLowerCase());
		if (ids == null) return([]);

		if (id != null)
		{
			fields = ids.get(id);

			if (fields == null)
				fields = [];

			return(fields);
		}

		ids.forEach((flds:Field[]) =>
		{flds.forEach((fld) => {fields.push(fld)});});

		return(fields);
	}

	public getAll() : Map<string,Field[]>
	{
		if (this.fields != null)
			return(this.fields);

		this.fields = new Map<string,Field[]>();
		this.groups.forEach((ids:Map<string,Field[]>,name:string) =>
		{
			let flds:Field[] = [];

			ids.forEach((flds:Field[]) =>
			{
				flds.forEach((fld:Field) =>
				{
					flds.push(fld);
				});
			});

			this.fields.set(name,flds);
		});

		return(this.fields);
	}
}


export class FieldInstance
{
	private static instances:Map<number,Row> = new Map<number,Row>();

	public static add(field:Field) : void
	{
		let row:number = field.row;
		let bucket:Row = FieldInstance.instances.get(row);

		if (bucket == null)
		{
			bucket = new Row();
			FieldInstance.instances.set(row,bucket)
		}

		bucket.add(field);
	}

	public static get(row:number,name:string,id?:string) : Field[]
	{
		let bucket:Row = FieldInstance.instances.get(row);
		if (bucket == null) return([]);
		return(bucket.get(name,id));
	}

	public static getAll(row:number) : Map<string,Field[]>
	{
		let bucket:Row = FieldInstance.instances.get(row);
		if (bucket == null) return(new Map<string,Field[]>());
		return(bucket.getAll());
	}
}