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
import { SQLSource } from "./SQLSource.js";
import { Record } from "../model/Record.js";
import { Alert } from "../application/Alert.js";
import { SQLRestBuilder } from "./SQLRestBuilder.js";
import { Connection } from "../public/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { DatabaseResponse } from "./DatabaseResponse.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { Connection as DatabaseConnection } from "../database/Connection.js";

export class QueryTable extends SQLSource implements DataSource
{
	public name:string;
	public arrayfecth:number = 32;
	public queryallowed:boolean = true;

	private eof$:boolean = false;
	private described$:boolean = false;

	private sql$:string = null;
	private order$:string = null;
	private cursor$:string = null;

	private columns$:string[] = [];
	private fetched$:Record[] = [];

	private nosql$:FilterStructure;
	private limit$:FilterStructure = null;
	private conn$:DatabaseConnection = null;

	private datatypes$:Map<string,DataType> =
		new Map<string,DataType>();

	public constructor(connection:Connection, sql?:string)
	{
		super();
		this.sql$ = sql;

		if (!(connection instanceof DatabaseConnection))
			connection = DatabaseConnection.getConnection(connection.name);

		if (connection == null)
		{
			Alert.fatal("Connection for database statement '"+connection.name+"' is not a DatabaseConnection","Database Procedure");
			return;
		}

		this.conn$ = connection as DatabaseConnection;
	}

	public set sql(sql:string)
	{
		this.sql$ = sql;
		this.described$ = false;
	}

	public clone() : QueryTable
	{
		let clone:QueryTable = new QueryTable(this.conn$,this.sql$);

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

	public get rowlocking() : boolean
	{
		return(false);
	}

	public get insertallowed() : boolean
	{
		return(false);
	}

	public get updateallowed() : boolean
	{
		return(false);
	}

	public get deleteallowed() : boolean
	{
		return(false);
	}


	public setDataType(column:string,type:DataType) : QueryTable
	{
		this.datatypes$.set(column?.toLowerCase(),type);
		return(this);
	}

	public addColumns(_columns:string|string[]) : void
	{
	}

	public addFilter(filter:Filter | FilterStructure) : void
	{
		if (this.limit$ == null)
		{
			if (filter instanceof FilterStructure)
			{
				this.limit$ = filter;
				return;
			}

			this.limit$ = new FilterStructure();
		}

		this.limit$.and(filter);
	}

	public async lock(_record:Record) : Promise<boolean>
	{
		Alert.fatal("Cannot lock records on datasource based on a query","Datasource");
		return(false);
	}

	public async flush() : Promise<Record[]>
	{
		return([]);
	}

	public async refresh(record:Record) : Promise<void>
	{
		record.refresh();
	}

	public async insert(_record:Record) : Promise<boolean>
	{
		Alert.fatal("Cannot insert records into a datasource based on a query","Datasource");
		return(false);
	}

	public async update(_record:Record) : Promise<boolean>
	{
		Alert.fatal("Cannot update records on a datasource based on a query","Datasource");
		return(false);
	}

	public async delete(_record:Record) : Promise<boolean>
	{
		Alert.fatal("Cannot delete records on a datasource based on a query","Datasource");
		return(false);
	}

	public async getSubQuery(_filter:FilterStructure, _mstcols:string|string[], _detcols:string|string[]) : Promise<SQLRest>
	{
		return(null);
	}

	public async query(filter?:FilterStructure) : Promise<boolean>
	{
		this.eof$ = false;
		this.fetched$ = [];
		this.nosql$ = null;
		filter = filter?.clone();

		if (!this.conn$.connected())
		{
			Alert.warning("Not connected","Database Connection");
			return(false);
		}

		if (!await this.describe())
			return(false);

		if (this.limit$ != null)
		{
			if (!filter) filter = this.limit$;
			else filter.and(this.limit$,"limit");
		}

		this.setTypes(filter?.get("qbe")?.getBindValues());
		this.setTypes(filter?.get("limit")?.getBindValues());
		this.setTypes(filter?.get("masters")?.getBindValues());

		let details:FilterStructure = filter?.getFilterStructure("details");

		if (details != null)
		{
			let filters:Filter[] = details.getFilters();

			for (let i = 0; i < filters.length; i++)
			{
				let df:Filter = filters[i];

				if (df instanceof SubQuery && df.subquery == null)
				{
					if (this.nosql$ == null)
						this.nosql$ = new FilterStructure(this.name+".nosql");

					details.delete(df);
					this.nosql$.and(df);
				}
			}
		}

		this.createCursor();

		let sql:SQLRest = SQLRestBuilder.finish(this.sql$,filter,this.sorting);
		let response:any = await this.conn$.select(sql,this.cursor$,this.arrayfecth);

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

		let response:any = await this.conn$.fetch(this.cursor$);

		if (!response.success)
		{
			console.error(this.name+" failed to fetch: "+JSON.stringify(response));
			return([]);
		}

		let fetched:Record[] = this.parse(response);

		fetched = await this.filter(fetched);

		if (fetched.length == 0)
			return(this.fetch());

		return(fetched);
	}

	public async closeCursor() : Promise<boolean>
	{
		let response:any = null;

		if (this.cursor$ != null && !this.eof$)
			response = await this.conn$.close(this.cursor$);

		this.eof$ = true;
		this.fetched$ = [];

		if (response)
			return(response.success);

		return(true);
	}

	private createCursor() : void
	{
		this.closeCursor();
		this.cursor$ = "select"+(new Date().getTime());
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

		sql.stmt += this.sql$ + " and 1 = 2";

		let cursor:string = "desc."+(new Date().getTime());
		let response:any = await this.conn$.select(sql,cursor,1,true);

		if (!response.success)
		{
			Alert.warning("Unable to describe query '"+this.sql$+"'","Database");
			return(false);
		}

		let columns:string[] = response.columns;

		for (let i = 0; i < columns.length; i++)
		{
			let type:string = response.types[i];
			let cname:string = columns[i].toLowerCase();
			let datatype:DataType = DataType[type.toLowerCase()];

			let exist:DataType = this.datatypes$.get(cname);
			if (!exist) this.datatypes$.set(cname,datatype);
		}

		this.columns$ = columns;
		this.described$ = response.success;
		return(this.described$);
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

			let response:any = {succes: true, rows: [rows[r]]};
			record.response = new DatabaseResponse(response, this.columns);

			fetched.push(record);
		}

		return(fetched);
	}
}