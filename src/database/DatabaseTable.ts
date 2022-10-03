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

import { SQLRest } from "./SQLRest.js";
import { Alert } from "../application/Alert.js";
import { SQLRestBuilder } from "./SQLRestBuilder.js";
import { Connection } from "../public/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { Record, RecordState } from "../model/Record.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { Connection as DatabaseConnection } from "../database/Connection.js";

export class DatabaseTable implements DataSource
{
	public arrayfecth:number = 32;
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

	private insreturncolumns$:string[] = null;
	private updreturncolumns$:string[] = null;
	private delreturncolumns$:string[] = null;

	public constructor(connection:Connection, table:string, columns?:string|string[])
	{
		this.table$ = table;

		if (!(connection instanceof DatabaseConnection))
		{
			Alert.fatal("Datasource for table '"+table+"' Connection '"+connection.name+"' is not a DatabaseConnection","Datasource");
			return;
		}

		this.conn$ = connection;

		if (columns != null)
		{
			if (!Array.isArray(columns))
				columns = [columns];

			this.columns$ = columns;
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
		this.addColumns(columns);
		this.primary$ = columns;
	}

	public get insertReturnColumns() : string[]
	{
		return(this.insreturncolumns$);
	}

	public set insertReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.insreturncolumns$ = columns;
	}

	public get updateReturnColumns() : string[]
	{
		return(this.updreturncolumns$);
	}

	public set updateReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.updreturncolumns$ = columns;
	}

	public get deleteReturgColumns() : string[]
	{
		return(this.delreturncolumns$);
	}

	public set deleteReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.delreturncolumns$ = columns;
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
		let sql:SQLRest = null;

		if (this.primary$ == null)
			this.primary$ = this.columns$;

		this.dirty$.forEach((rec) =>
		{
			if (rec.state == RecordState.Inserted)
			{
				processed.push(rec);
				sql = SQLRestBuilder.insert(this.table$,this.columns,rec,this.insreturncolumns$);
				rec.response = this.conn$.insert(sql);
			}

			if (rec.state == RecordState.Updated)
			{
				processed.push(rec);
				sql = SQLRestBuilder.update(this.table$,this.columns,rec,this.insreturncolumns$);
				rec.response = this.conn$.update(sql);
			}

			if (rec.state == RecordState.Deleted)
			{
				processed.push(rec);
				sql = SQLRestBuilder.delete(this.table$,this.primary$,rec,this.insreturncolumns$);
				rec.response = this.conn$.delete(sql);
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

		let sql:SQLRest = SQLRestBuilder.select(this.table$,this.columns,filter,this.sorting);
		let response:any = await this.conn$.select(sql,this.cursor,this.arrayfecth);

		this.fetched$ = this.parse(response);
		return(true);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.fetched$.length > 0)
		{
			let fetched:Record[] = [];
			fetched.push(...this.fetched$);

			this.fetched$ = [];
			return(fetched);
		}

		if (this.eof$)
			return([]);

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

		if (this.primary$ == null)
			this.primary$ = this.columns$;

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