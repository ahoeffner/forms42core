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

import { Field } from "./Field";

class Row
{
	private groups:Map<string,Field[]> = new Map<string,Field[]>();

	public add(field:Field) : void
	{
		let fields:Field[] = this.groups.get(field.name);

		if (fields == null)
		{
			fields = [];
			this.groups.set(field.name,fields);
		}

		fields.push(field);
	}

	public get(name:string) : Field[]
	{
		let fields:Field[] = this.groups.get(name.toLowerCase());
		if (fields == null) return([]);
		return(fields);
	}

	public getAll() : Map<string,Field[]>
	{
		return(this.groups);
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

	public static get(row:number, name:string) : Field[]
	{
		let bucket:Row = FieldInstance.instances.get(row);
		if (bucket == null) return([]);
		return(bucket.get(name));
	}

	public static getAll(row:number) : Map<string,Field[]>
	{
		let bucket:Row = FieldInstance.instances.get(row);
		if (bucket == null) return(new Map<string,Field[]>());
		return(bucket.getAll());
	}
}