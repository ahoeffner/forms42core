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
	private columns$:{[name: string]: any};
	private status$:RecordStatus = RecordStatus.Query;

	constructor(columns?:{[name: string]: any})
	{
		this.columns$ = columns;
		this.id$ = new Object();
		
		if (columns == null)
		{
			this.columns$ = {};
			this.status$ = RecordStatus.New;
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

	public get columns() : {[name: string]: any}
	{
		return(this.columns$);
	}
}