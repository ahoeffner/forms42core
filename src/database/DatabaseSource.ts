/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Cursor } from "./Cursor.js";
import { SQLSource } from "./SQLSource.js";
import { BindValue } from "./BindValue.js";
import { Record } from "../model/Record.js";
import { Head } from "./serializable/Head.js";
import { MSGGRP } from "../messages/Internal.js";
import { Messages } from "../messages/Messages.js";
import { Connection } from "../database/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
import { DataSource, LockMode } from "../model/interfaces/DataSource.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { Query } from "./serializable/Query.js";


/**
 * Datasource based on a table/view using OpenJsonDB
 */
export class DatabaseSource extends SQLSource implements DataSource
{
	private order$:string = null;
	private source$:string = null;
	private cursor$:Cursor = null;

	private jdbconn$:Connection = null;
	private pubconn$:DatabaseConnection = null;

	private dirty$:Record[] = [];
	private fetched$:Record[] = [];

	private columns$:string[] = [];
	private primary$:string[] = [];
	private described$:boolean = false;

	private limit$:FilterStructure = null;
	private nosql$:FilterStructure = null;

	public name:string;
	public arrayfecth:number = 32;
	public queryallowed:boolean = true;
	public insertallowed:boolean = true;
	public updateallowed:boolean = true;
	public deleteallowed:boolean = true;
	public rowlocking:LockMode = LockMode.Pessimistic;

	private datatypes$:Map<string,string> =
		new Map<string,string>();


	/**
	 *  @param connection 	: OpenJsonDB connection to a database
	 *  @param source 		: OpenJsonDB datasource i.e. table/view/query
	 *  @param columns 		: Columns in play from the table/view/query
	 */
	public constructor(connection:DatabaseConnection, source:string, columns?:string|string[])
	{
		super();
		console.log("DatabaseSource "+source)

		if (connection == null)
		{
			// Cannot create object when onnection is null
			Messages.severe(MSGGRP.ORDB,2,this.constructor.name);
			return;
		}

		if (columns != null)
		{
			if (!Array.isArray(columns))
				columns = [columns];

			this.columns$ = columns;
		}

		this.name = source;
		this.source$ = source;
		this.pubconn$ = connection;
		this.jdbconn$ = connection["conn$"];
	}

	/** Set the table/view */
	public set source(source:string)
	{
		this.source$ = source;
		this.described$ = false;
	}

	/** The order by clause */
	public get sorting() : string
	{
		return(this.order$);
	}

	/** The order by clause */
	public set sorting(order:string)
	{
		this.order$ = order;
	}

	/** The columns used by this datasource */
	public get columns() : string[]
	{
		return(this.columns$);
	}

	/** Set the column names involved */
	public set columns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = columns;
	}

	/** Whether the datasource is transactional */
	public get transactional() : boolean
	{
		return(this.jdbconn$.transactional);
	}

	/** Closes backend cursor */
	public clear() : void
	{
		this.dirty$ = [];

		if (this.cursor$ && !this.cursor$.eof)
			this.jdbconn$.close(this.cursor$);

		this.cursor$ = null;
	}


	clone(): DataSource
	{
		throw new Error("Method not implemented.");
	}


	undo(): Promise<Record[]>
	{
		throw new Error("Method not implemented.");
	}


	fetch(): Promise<Record[]>
	{
		throw new Error("Method not implemented.");
	}


	flush(): Promise<Record[]>
	{
		throw new Error("Method not implemented.");
	}

	/** Close the database cursor */
	public async closeCursor() : Promise<boolean>
	{
		let response:any = null;

		if (this.cursor$ && !this.cursor$.eof)
			response = await this.jdbconn$.close(this.cursor$);

		this.fetched$ = [];
		this.cursor$ = null;

		if (response)
			return(response.success);

		return(true);
	}


	lock(record: Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}


	insert(record: Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}


	update(record: Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}


	delete(record: Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}


	refresh(record: Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}


	public async query(filter?: FilterStructure): Promise<boolean>
	{
		this.fetched$ = [];
		this.nosql$ = null;
		filter = filter?.clone();

		if (!this.jdbconn$.connected())
		{
			// Not connected
			Messages.severe(MSGGRP.ORDB,3,this.constructor.name);
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

				if (df instanceof SubQuery && df.sqlstmt == null)
				{
					if (this.nosql$ == null)
						this.nosql$ = new FilterStructure(this.name+".nosql");

					details.delete(df);
					this.nosql$.and(df);
					this.addColumns(df.columns);
				}
			}
		}

		let cursor:string = this.createCursor();
		let query:Query = new Query(this,this.columns,filter);

		query.cursor = cursor;
		query.orderBy = this.sorting;

		let response:any = await this.jdbconn$.send(query);
		console.log(response);
	}


	/** Return the default filters */
	public getFilters() : FilterStructure
	{
		return(this.limit$);
	}

	/** Add columns participating in all operations on the table/view */
	public addColumns(columns:string|string[]) : DatabaseSource
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = this.mergeColumns(this.columns$,columns);
		return(this);
	}

	/** Remove columns participating in all operations on the table/view */
	public removeColumns(columns:string|string[]) : DatabaseSource
	{
		if (!Array.isArray(columns))
			columns = [columns];

		let cols:string[] = [];

		for (let i = 0; i < columns.length; i++)
			columns[i] = columns[i]?.toLowerCase();

		for (let i = 0; i < this.columns$.length; i++)
		{
			if (!columns.includes(this.columns$[i]))
				cols.push(this.columns$[i]);
		}

		this.columns$ = cols;
		return(this);
	}

	/** Add a default filter */
	public addFilter(filter:FilterStructure | Filter) : DataSource
	{
		if (this.limit$ == null)
		{
			if (filter instanceof FilterStructure)
			{
				this.limit$ = filter;
				return(this);
			}

			this.limit$ = new FilterStructure();
		}

		this.limit$.and(filter);
		return(this);
	}

	private createCursor() : string
	{
		if (this.cursor$ && !this.cursor$.eof)
			this.jdbconn$.close(this.cursor$);

		this.cursor$ = new Cursor();
		return(this.cursor$.name);
	}

	private setTypes(bindvalues:BindValue[]) : void
	{
		bindvalues?.forEach((b) =>
		{
			let col:string = b.column?.toLowerCase();
			let t:string = this.datatypes$.get(col);
			if (!b.forceDataType && t != null) b.type = t;
		})
	}

	private async describe() : Promise<boolean>
	{
		if (this.described$)
			return(true);

		let head:Head = new Head(this);
		let response:any = await this.jdbconn$.send(head);

		if (!response.success)
		{
			// Unable to get column definitions
			Messages.severe(MSGGRP.SQL,3,this.source$,response.message);
			return(false);
		}

		let columns:string[] = response.columns;

		for (let i = 0; i < columns.length; i++)
		{
			columns[i] = columns[i].toLowerCase();

			let type:string = response.types[i];
			let datatype:string = type.toLowerCase();
			this.datatypes$.set(columns[i],datatype);
		}

		this.described$ = true;
		return(this.described$);
	}

	private mergeColumns(list1:string[], list2:string[]) : string[]
	{
		let cnames:string[] = [];
		let columns:string[] = [];

		list1?.forEach((col) =>
		{
			col = col.toLowerCase();

			columns.push(col);
			cnames.push(col);
		})

		list2?.forEach((col) =>
		{
			col = col.toLowerCase();

			if (!cnames.includes(col))
			{
				columns.push(col);
				cnames.push(col);
			}
		})

		return(columns);
	}
}