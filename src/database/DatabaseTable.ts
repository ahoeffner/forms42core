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

import { SQLStatement } from "./SQLStatement.js";
import { Filter } from "../model/interfaces/Filter.js";
import { Record, RecordState } from "../model/Record.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { Connection as DatabaseConnection } from "../database/Connection.js";

export class DatabaseTable implements DataSource
{
	private pos$:number = 0;
	private dirty$:Record[] = [];

	private table$:string = null;
	private order$:string = null;
	private columns$:string[] = [];
	private records$:Record[] = [];

	public arrayfecth:number = 32;
	private filter:FilterStructure;
	private limit$:FilterStructure = null;
	private conn$:DatabaseConnection = null;

	public constructor(connection:DatabaseConnection, table:string, columns?:string|string[])
	{
		this.table$ = table;
		this.conn$ = connection;

		if (columns != null)
		{
			if (!Array.isArray(columns))
				columns = [columns];

			this.columns$ = columns;
		}
	}

	public clone(columns?:string|string[]) : DatabaseTable
	{
		let clone:DatabaseTable = new DatabaseTable(this.conn$,this.table$,columns);

		clone.sorting = this.sorting;
		clone.arrayfecth = this.arrayfecth;

		return(clone);
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

	public limit(filters:Filter | Filter[] | FilterStructure) : void
	{
		if (filters instanceof FilterStructure)
		{
			this.limit$ = filters;
		}
		else
		{
			if (!Array.isArray(filters))
				filters = [filters];

			this.limit$ = new FilterStructure();

			for (let i = 0; i < filters.length; i++)
				this.limit$.and(filters[i]);
		}
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

		if (this.limit$ != null)
		{
			if (!this.filter) this.filter = this.limit$;
			else this.filter.and(this.limit$,"limit");
		}

		let sql:string = SQLStatement.select(this.table$,this.columns,filter,this.sorting,this.arrayfecth);
		this.conn$.select(sql,"123",this.arrayfecth);

		return(true);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.pos$ >= this.records$.length)
			return([]);

		let fetched:Record[] = [];
		let pos:number = this.pos$;

		//while(this.pos$ < this.records$.length)
			//fetched.push(this.records$[this.pos$++]);

		return(fetched);
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
