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

export enum RecordStatus
{
	New,
	Query,
	Insert,
	Update,
	Delete
}

export class Record
{
	private id$:any;
	private status$:RecordStatus = RecordStatus.Query;
	private columns$:Map<string,any> = new Map<string,any>();

	constructor(columns?:{[name: string]: any})
	{
		this.id$ = new Object();

		if (columns == null)
		{
			this.status$ = RecordStatus.New;
		}
		else
		{
			Object.keys(columns).forEach((col) =>
			{this.columns$.set(col.toLowerCase(),columns[col])});
		}
	}

	public get id() : any
	{
		return(this.id$);
	}

	public get status() : RecordStatus
	{
		return(this.status$);
	}

	public set status(status:RecordStatus)
	{
		this.status$ = status;
	}

	public getValue(column:string) : any
	{
		return(this.columns$.get(column.toLowerCase()));
	}

	public setValue(column:string,value:any) : void
	{
		this.columns$.set(column.toLowerCase(),value);
	}
}