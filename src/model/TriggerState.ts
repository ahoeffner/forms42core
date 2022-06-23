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

import { Record } from "./Record.js";

export class TriggerState
{
	private dirty$:boolean = true;
	private wrkcpy$:Record = null;
	private record$:Record = null;

	public constructor(record?:Record, clone?:boolean)
	{
		this.record$ = record;
		this.wrkcpy$ = record;

		if (clone)
		{
			this.wrkcpy$ = new Record(null);
			record.values.forEach((column) =>
			{this.wrkcpy$.setValue(column.name,column.value)})
		}
	}

	public dirty() : boolean
	{
		return(this.dirty$);
	}

	public setRecord(record:Record, clone:boolean)
	{
		this.record$ = record;
		this.wrkcpy$ = record;

		if (clone)
		{
			this.wrkcpy$ = new Record(null);
			record.values.forEach((column) =>
			{this.wrkcpy$.setValue(column.name,column.value)})
		}
	}

	public getValue(column:string) : any
	{
		return(this.wrkcpy$.getValue(column));
	}

	public setValue(column:string, value:any) : void
	{
		this.dirty$ = true;
		this.record$.setValue(column,value);
	}

	public applychanges() : void
	{
		if (this.wrkcpy$ != this.record$)
		{
			this.wrkcpy$.values.forEach((column) =>
			{this.record$.setValue(column.name,column.value)})
		}
	}
}