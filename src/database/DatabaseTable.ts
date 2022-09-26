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

import { Record, RecordState } from "../model/Record.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";

export class DatabaseTable implements DataSource
{
	private pos$:number = 0;
	private dirty$:Record[] = [];

	private table$:string = null;
	private order$:string = null;
	private columns$:string[] = [];
	private records$:Record[] = [];

	public arrayfecth:number = 1;
	private filter:FilterStructure;

	public constructor(table:string, columns?:string|string[])
	{
		this.table$ = table;
	}

	public clone(columns?:string|string[]) : DatabaseTable
	{
		return(null);
	}

	public get sorting() : string
	{
		return(this.order$);
	}

	public set sorting(order:string)
	{
		this.order$ = order;
	}

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public addColumns(columns:string|string[]) : void
	{
		if (!Array.isArray(columns))
			columns = [columns];

		columns.forEach((column) =>
		{
			column = column?.toLowerCase();

			if (column && !this.columns$.includes(column))
				this.columns$.push(column);
		})
	}

	public async lock(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async flush() : Promise<Record[]>
	{
		let processed:Record[] = [];

		this.dirty$.forEach((rec) =>
		{
			if (rec.state == RecordState.Inserted)
			{
				processed.push(rec);
				this.records$.push(rec);
				rec.response = "inserted";
			}

			if (rec.state == RecordState.Updated)
			{
				processed.push(rec);
				rec.response = "updated";
			}

			if (rec.state == RecordState.Deleted)
			{
				processed.push(rec);
				rec.response = "deleted";

				let recno:number = this.indexOf(this.records$,rec.id);

				if (recno >= 0)
				{
					this.pos$--;
					this.records$.splice(recno,1);
				}
			}
		});

		this.dirty$ = [];
		return(processed);
	}

	public async refresh(_record:Record) : Promise<void>
	{
	}

	public async insert(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	public async update(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	public async delete(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	public async query(filter:FilterStructure) : Promise<boolean>
	{
		this.pos$ = 0;
		this.filter = filter;

		return(true);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.pos$ >= this.records$.length)
			return([]);

		while(this.pos$ < this.records$.length)
		{
			return([this.records$[this.pos$++]]);
		}

		return([]);
	}

	public async closeCursor() : Promise<boolean>
	{
		return(true);
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
