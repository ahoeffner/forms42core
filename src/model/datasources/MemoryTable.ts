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

import { Filter } from "../interfaces/Filter.js";
import { Record, RecordStatus } from "../Record.js";
import { DataSource } from "../interfaces/DataSource.js";

export class MemoryTable implements DataSource
{
	private pos$:number = 0;
	private rows$:number = -1;

	private columns$:string[] = [];
	private records$:Record[] = [];

	private filters:Filter[] = [];

	public arrayfecth:number = 1;
	private insertable$:boolean = true;

	public queryable:boolean  = true;
	public updateable:boolean = true;
	public deleteable:boolean = true;

	public constructor(columns:string[], records:any[][])
	{
		if (columns == null) columns = [];
		if (records == null) records = [];

		this.columns$ = columns;

		records.forEach((rec) =>
		{
			let data:{[name:string]: any} = {};

			for (let i = 0; i < rec.length && i < columns.length; i++)
				data[columns[i]] = rec[i];

			this.records$.push(new Record(this,data));
		});
	}

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public set maxrows(rows:number)
	{
		this.rows$ = rows;
	}

	public get insertable() : boolean
	{
		return(this.insertable$ && (this.rows$ < 0 || this.records$.length < this.rows$));
	}

	public set insertable(flag:boolean)
	{
		this.insertable$ = flag;
	}

	public async lock(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async post() : Promise<boolean>
	{
		return(true);
	}

	public async refresh(_record:Record) : Promise<void>
	{
		null;
	}

	public async insert(record:Record) : Promise<boolean>
	{
		this.records$.splice(this.pos$,0,record);
		return(true);
	}

	public async update(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async delete(record:Record) : Promise<boolean>
	{
		let rec:number = this.indexOf(this.records$,record.id);

		if (rec >= 0)
			this.records$ = this.records$.splice(rec,1);

		return(rec >= 0);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.pos$ >= this.records$.length)
			return([]);

		while(this.pos$ < this.records$.length)
		{
			if (this.records$[this.pos$].status == RecordStatus.Delete)
				continue;

			if (this.filters.length == 0)
				return([this.records$[this.pos$++]]);

			for (let f = 0; f < this.filters.length; f++)
			{
				if (await this.filters[f].matches(this.records$[this.pos$]))
					return([this.records$[this.pos$++]]);
			}

			this.pos$++;
		}

		return([]);
	}

	public async query(filters?:Filter|Filter[]) : Promise<boolean>
	{
		this.post();

		if (!this.queryable)
			return(false);

		this.pos$ = 0;
		this.filters = [];

		this.records$.forEach((record) =>
			{record.prepared = false})

		if (filters != null)
		{
			if (Array.isArray(filters)) this.filters = filters;
			else						this.filters.push(filters);
		}

		return(true);
	}

	public closeCursor(): void
	{
		null;
	}

	private indexOf(records:Record[],oid:any) : number
	{
		for (let i = 0; i < records.length; i++)
		{
			if (records[i].id == oid)
				return(i);
		}
		return(-1);
	}
}