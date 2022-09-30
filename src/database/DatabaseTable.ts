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

import { SQLBuilder } from "./SQLBuilder.js";
import { SQLStatement } from "./SQLStatement.js";
import { Filter } from "../model/interfaces/Filter.js";
import { Record, RecordState } from "../model/Record.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { Connection as DatabaseConnection } from "../database/Connection.js";

export class DatabaseTable implements DataSource
{
	public arrayfecth:number = 1;
	public queryallowed:boolean = true;
	public insertallowed:boolean = true;
	public updateallowed:boolean = true;
	public deleteallowed:boolean = true;

	private dirty$:Record[] = [];
	private eof$:boolean = false;

	private table$:string = null;
	private cursor:string = null;
	private order$:string = null;

	private columns$:string[] = [];
	private primary$:string[] = [];

	private fetched$:Record[] = [];

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
			this.primary$ = columns;
		}

		this.cursor = table+(new Date().getTime());
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

	public get primaryKey() : string[]
	{
		return(this.primary$);
	}

	public set primaryKey(columns:string|string[])
	{
		if (!Array.isArray(columns)) columns = [columns];
		this.primary$ = columns;
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

	public async query(filter?:FilterStructure) : Promise<boolean>
	{
		this.eof$ = false;
		this.fetched$ = [];
		this.filter = filter;

		if (this.limit$ != null)
		{
			if (!this.filter) this.filter = this.limit$;
			else this.filter.and(this.limit$,"limit");
		}

		let sql:SQLStatement = SQLBuilder.select(this.table$,this.columns,filter,this.sorting);
		let response:any = await this.conn$.select(sql,this.cursor,this.arrayfecth);

		this.fetched$ = this.parse(response);
		return(true);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.eof$)
			return([]);

		if (this.fetched$.length > 0)
		{
			let fetched:Record[] = [];
			fetched.push(...this.fetched$);

			this.fetched$ = [];
			return(fetched);
		}

		let response:any = await this.conn$.fetch(this.cursor);
		return(this.parse(response));
	}

	public async closeCursor() : Promise<boolean>
	{
		this.eof$ = true;
		this.fetched$ = [];
		return(true);
	}

	private parse(response:any) : Record[]
	{
		let fetched:Record[] = [];
		this.eof$ = !response.more;
		let rows:any[][] = response.rows;

		if (!response.success)
		{
			this.eof$ = true;
			return(fetched);
		}

		for (let r = 0; r < rows.length; r++)
		{
			let keys:any[] = [];
			let record:Record = new Record(this);

			for (let c = 0; c < rows[r].length; c++)
				record.setValue(this.columns[c],rows[r][c]);

			this.primary$.forEach((col) =>
			{keys.push(record.getValue(col))})

			record.keys = keys;
			fetched.push(record);
		}

		return(fetched);
	}
}