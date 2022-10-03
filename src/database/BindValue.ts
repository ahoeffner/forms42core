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

import { DataType } from "./DataType";

export class BindValue
{
	private value$:any = null;
	private name$:string = null;
	private type$:string = null;

	public constructor(name:string, value:any, type?:DataType|string)
	{
		if (typeof type != "string")
			type = DataType[type];

		this.name = name;
		this.type = type;
		this.value = value;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public set name(name:string)
	{
		this.name$ = name;
	}

	public get type() : string
	{
		if (this.type$ == null)
			return("string");

		return(this.type$);
	}

	public set type(type:string)
	{
		this.type$ = type;
	}

	public get value() : any
	{
		return(this.value$);
	}

	public set value(value:any)
	{
		this.value$ = value;

		if (this.type$ == null && !isNaN(+value))
			this.type$ = "number";

		if (value instanceof Date)
		{
			this.value$ = value.getTime();
			if (this.type$ == null) this.type$ = "date";
		}
	}

	public toString() : string
	{
		return("{"+this.name+" "+this.type+" "+this.value+"}")
	}
}