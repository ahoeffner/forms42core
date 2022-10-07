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
import { DataType } from "./DataType.js";
import { BindValue } from "./BindValue.js";
import { Alert } from "../application/Alert.js";
import { SQLRestBuilder } from "./SQLRestBuilder.js";
import { Connection } from "../public/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { Record, RecordState } from "../model/Record.js";
import { DatabaseResponse } from "./DatabaseResponse.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { Connection as DatabaseConnection } from "../database/Connection.js";

export class DatabaseTable implements DataSource
{
	public name:string;
	public arrayfecth:number = 32;
	public queryallowed:boolean = true;
	public insertallowed:boolean = true;
	public updateallowed:boolean = true;
	public deleteallowed:boolean = true;

	public OptimisticLocking:boolean = true;

	private dirty$:Record[] = [];
	private eof$:boolean = false;

	private described$:boolean = false;

	private table$:string = null;
	private cursor:string = null;
	private order$:string = null;

	private columns$:string[] = [];
	private primary$:string[] = [];
	private dmlcols$:string[] = [];

	private fetched$:Record[] = [];

	private nosql$:FilterStructure;
	private filter$:FilterStructure;
	private limit$:FilterStructure = null;
	private conn$:DatabaseConnection = null;

	private insreturncolumns$:string[] = null;
	private updreturncolumns$:string[] = null;
	private delreturncolumns$:string[] = null;

	private datatypes$:Map<string,DataType> =
		new Map<string,DataType>();

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
		clone.columns$ = this.columns$;
		clone.described$ = this.described$;
		clone.arrayfecth = this.arrayfecth;
		clone.datatypes$ = this.datatypes$;

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

	public set columns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = columns;
	}

	public get primaryKey() : string[]
	{
		return(this.primary$);
	}

	public setDataType(column:string,type:DataType) : DatabaseTable
	{
		this.datatypes$.set(column?.toLowerCase(),type);
		return(this);
	}

	public set primaryKey(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

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

	public get deleteReturnColumns() : string[]
	{
		return(this.delreturncolumns$);
	}

	public set deleteReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.delreturncolumns$ = columns;
	}

	public addDMLColumns(columns:string|string[]) : void
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.dmlcols$ = this.mergeColumns(this.dmlcols$,columns);
	}

	public addColumns(columns:string|string[]) : void
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = this.mergeColumns(this.columns$,columns);
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

	public async lock(record:Record) : Promise<boolean>
	{
		if (this.OptimisticLocking)
			return(true);

		let sql:SQLRest = null;
		await this.describe();

		sql = SQLRestBuilder.lock(this.table$,this.primary$,this.columns,record);
		await this.conn$.lock(sql);

		return(true);
	}

	public async flush() : Promise<Record[]>
	{
		let sql:SQLRest = null;
		let response:any = null;
		let processed:Record[] = [];

		if (!this.conn$.connected())
		{
			Alert.warning("Not connected","Database Connection");
			return([]);
		}

		if (this.primary$ == null)
			this.primary$ = this.columns$;

		await this.describe();

		for (let i = 0; i < this.dirty$.length; i++)
		{
			let rec:Record = this.dirty$[i];

			if (rec.state == RecordState.Inserted)
			{
				processed.push(rec);

				let columns:string[] = this.mergeColumns(this.columns,this.dmlcols$);
				sql = SQLRestBuilder.insert(this.table$,columns,rec,this.insreturncolumns$);

				this.setTypes(sql.bindvalues);
				response = await this.conn$.insert(sql);

				this.castResponse(response);
				rec.response = new DatabaseResponse(response,this.insreturncolumns$);
			}

			if (rec.state == RecordState.Updated)
			{
				processed.push(rec);

				let columns:string[] = this.mergeColumns(this.columns,this.dmlcols$);
				sql = SQLRestBuilder.update(this.table$,this.primary$,columns,rec,this.updreturncolumns$);

				this.setTypes(sql.bindvalues);
				response = await this.conn$.update(sql);

				this.castResponse(response);
				rec.response = new DatabaseResponse(response,this.updreturncolumns$);
			}

			if (rec.state == RecordState.Deleted)
			{
				processed.push(rec);
				sql = SQLRestBuilder.delete(this.table$,this.primary$,rec,this.delreturncolumns$);

				this.setTypes(sql.bindvalues);
				response = await this.conn$.delete(sql);

				this.castResponse(response);
				rec.response = new DatabaseResponse(response,this.delreturncolumns$);
			}
		}

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

		this.nosql$ = null;
		this.filter$ = filter;

		if (!this.conn$.connected())
		{
			Alert.warning("Not connected","Database Connection");
			return(false);
		}

		await this.describe();

		if (this.limit$ != null)
		{
			if (!this.filter$) this.filter$ = this.limit$;
			else this.filter$.and(this.limit$,"limit");
		}

		this.setTypes(filter?.get("qbe")?.getBindValues());
		this.setTypes(filter?.get("limit")?.getBindValues());
		this.setTypes(filter?.get("masters")?.getBindValues());

		let details:FilterStructure = filter?.getFilterStructure("details");

		if (details != null)
		{
			filter.delete(details);
			let filters:Filter[] = details.getFilters();

			for (let i = 0; i < filters.length; i++)
			{
				let df:Filter = filters[i];

				if (df instanceof SubQuery && df.subquery == null)
				{
					if (this.nosql$ == null)
						this.nosql$ = new FilterStructure();

					details.delete(df);
					this.nosql$.and(df);
				}
			}
		}

		let sql:SQLRest = SQLRestBuilder.select(this.table$,this.columns,filter,this.sorting);
		let response:any = await this.conn$.select(sql,this.cursor,this.arrayfecth);

		this.fetched$ = this.parse(response);
		this.fetched$ = await this.filter(this.fetched$);

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
		let fetched:Record[] = this.parse(response);

		fetched = await this.filter(fetched);

		if (fetched.length == 0)
			return(this.fetch());

		return(fetched);
	}

	public async closeCursor() : Promise<boolean>
	{
		this.eof$ = true;
		this.fetched$ = [];
		return(true);
	}

	private async filter(records:Record[]) : Promise<Record[]>
	{
		if (this.nosql$)
		{
			let passed:Record[] = [];

			for (let i = 0; i < records.length; i++)
			{
				if (await this.nosql$.evaluate(records[i]))
					passed.push(records[i]);
			}

			records = passed;
		}

		return(records);
	}

	private async describe() : Promise<boolean>
	{
		let sql:SQLRest = new SQLRest();
		if (this.described$) return(true);

		sql.stmt += "select * from "+this.table$;
		sql.stmt += " where 1 = 2";

		let cursor:string = "desc."+(new Date().getTime());
		let response:any = await this.conn$.select(sql,cursor,1,true);

		let columns:string[] = response.columns;

		for (let i = 0; i < columns.length; i++)
		{
			let type:string = response.types[i];
			let cname:string = columns[i].toLowerCase();
			let datatype:DataType = DataType[type.toLowerCase()];

			let exist:DataType = this.datatypes$.get(cname);
			if (!exist) this.datatypes$.set(cname,datatype);
		}

		this.described$ = true;
		return(response.succes);
	}

	private setTypes(bindvalues:BindValue[]) : void
	{
		bindvalues?.forEach((b) =>
		{
			let col:string = b.column?.toLowerCase();
			let t:DataType = this.datatypes$.get(col);
			if (t != null) b.type = DataType[t];
		})
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

		let datetypes:DataType[] = [DataType.date, DataType.datetime, DataType.timestamp];

		let dates:boolean[] = [];

		for (let c = 0; c < this.columns.length; c++)
		{
			let dt:DataType = this.datatypes$.get(this.columns[c].toLowerCase());
			if (datetypes.includes(dt)) dates.push(true);
			else dates.push(false);
		}

		for (let r = 0; r < rows.length; r++)
		{
			let keys:any[] = [];
			let record:Record = new Record(this);

			for (let c = 0; c < rows[r].length; c++)
			{
				if (rows[r][c] && dates[c])
				{
					if (typeof rows[r][c] === "number")
						rows[r][c] = new Date().setTime(+rows[r][c]);
				}

				record.setValue(this.columns[c],rows[r][c]);
			}

			this.primary$.forEach((col) =>
			{keys.push(record.getValue(col))})

			let response:any = {succes: true, rows: [rows[r]]};
			record.response = new DatabaseResponse(response, this.columns);

			record.keys = keys;
			fetched.push(record);
		}

		return(fetched);
	}

	private castResponse(response:any) : void
	{
		let rows:any[][] = response.rows;

		if (rows == null)
			return;

		let datetypes:DataType[] = [DataType.date, DataType.datetime, DataType.timestamp];

		for (let r = 0; r < rows.length; r++)
		{
			Object.keys(rows[r]).forEach((col) =>
			{
				col = col.toLowerCase();
				let value:any = rows[r][col];
				let dt:DataType = this.datatypes$.get(col);

				if (datetypes.includes(dt) && typeof value === "number")
					rows[r][col] = new Date(value);
			})
		}
	}

	private mergeColumns(list1:string[], list2:string[]) : string[]
	{
		let cname:string = null;
		let cnames:string[] = [];
		let columns:string[] = [];

		if (list1) columns.push(...list1);
		columns.forEach((col) => cnames.push(col.toLowerCase()));

		list2?.forEach((col) =>
		{
			if (!cnames.includes(col.toLowerCase()))
			{
				cname = col.toLowerCase();

				columns.push(col);
				cnames.push(cname);
			}
		})

		return(columns);
	}
}