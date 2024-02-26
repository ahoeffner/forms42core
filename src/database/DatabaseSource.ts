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
import { Head } from "./serializable/Head.js";
import { Query } from "./serializable/Query.js";
import { MSGGRP } from "../messages/Internal.js";
import { Connection } from "../database/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { Record, RecordState } from "../model/Record.js";
import { DatabaseResponse } from "./DatabaseResponse.js";
import { Level, Messages } from "../messages/Messages.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
import { DataSource, LockMode } from "../model/interfaces/DataSource.js";
import { Cursor as CFunc, CursorRequest as COPR } from "./serializable/Cursor.js";


/**
 * Datasource based on a table/view using OpenJsonDB
 */
export class DatabaseSource extends SQLSource implements DataSource
{
	private order$:string = null;
	private source$:string = null;
	private cursor$:Cursor = null;

	private described$:boolean = false;

	private jdbconn$:Connection = null;
	private pubconn$:DatabaseConnection = null;

	private dirty$:Record[] = [];
	private fetched$:Record[] = [];

	private columns$:string[] = [];
	private primary$:string[] = [];
	private dmlcols$:string[] = [];

	private limit$:FilterStructure = null;
	private nosql$:FilterStructure = null;

	public name:string;
	public arrayfecth:number = 32;
	public queryallowed: boolean = true;
	public insertallowed: boolean = true;
	public updateallowed: boolean = true;
	public deleteallowed: boolean = true;
	public rowlocking:LockMode = LockMode.Pessimistic;

	private insreturncolumns$:string[] = null;
	private updreturncolumns$:string[] = null;
	private delreturncolumns$:string[] = null;

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
		this.jdbconn$ = Connection.getConnection(connection);
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

	/** Get the primary key defined for this datasource */
	public get primaryKey() : string[]
	{
		if (this.primary$ == null || this.primary$.length == 0)
		{
			this.primary$ = [];
			this.primary$.push(...this.columns$);
		}

		return(this.primary$);
	}

	/** Set the primary key for this datasource */
	public set primaryKey(columns:string|string[])
	{
		if (!columns)
			columns = [];

		if (!Array.isArray(columns))
			columns = [columns];

		this.addColumns(columns);
		this.primary$ = columns;
	}

	/** Get columns defined for 'returning' after insert */
	public get insertReturnColumns() : string[]
	{
		return(this.insreturncolumns$);
	}

	/** Set columns defined for 'returning' after insert */
	public set insertReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.insreturncolumns$ = columns;
	}

	/** Get columns defined for 'returning' after update */
	public get updateReturnColumns() : string[]
	{
		return(this.updreturncolumns$);
	}

	/** Set columns defined for 'returning' after update */
	public set updateReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.updreturncolumns$ = columns;
	}

	/** Get columns defined for 'returning' after delete */
	public get deleteReturnColumns() : string[]
	{
		return(this.delreturncolumns$);
	}

	/** Set columns defined for 'returning' after delete */
	public set deleteReturnColumns(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.delreturncolumns$ = columns;
	}

	/** Add additional columns participating in insert, update and delete */
	public addDMLColumns(columns:string|string[]) : void
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.dmlcols$ = this.mergeColumns(this.dmlcols$,columns);
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
		throw new Error("clone not implemented.");
	}


	undo(): Promise<Record[]>
	{
		throw new Error("undo not implemented.");
	}


	/** Flush changes to backend */
	public async flush() : Promise<Record[]>
	{
		let processed:Record[] = [];

		if (!this.jdbconn$.connected())
		{
			Messages.severe(MSGGRP.ORDB,3,this.constructor.name);
			return([]);
		}

		if (this.dirty$.length == 0)
			return([]);

		if (!this.jdbconn$.connected())
		{
			// Not connected
			Messages.severe(MSGGRP.ORDB,3,this.constructor.name);
			return([]);
		}

		if (!await this.describe())
			return([]);

		for (let i = 0; i < this.dirty$.length; i++)
		{
			let retcols:string[] = [];
			let record:Record = this.dirty$[i];

			if (record.failed)
				continue;

			if (record.state == RecordState.Insert)
			{
				console.log("Insert");
				processed.push(record);
				record.response = null;

				retcols = this.insreturncolumns$;
				if (retcols == null) retcols = [];
			}

			else

			if (record.state == RecordState.Delete)
			{
				console.log("Delete");
				processed.push(record);
				record.response = null;

				retcols = this.delreturncolumns$;
				if (retcols == null) retcols = [];
			}

			else

			if (record.state != RecordState.Deleted)
			{
				// Might have been marked clean
				if (!record.dirty) continue;

				console.log("Update");
				processed.push(record);
				record.response = null;

				retcols = this.updreturncolumns$;
				if (retcols == null) retcols = [];
			}
		}

		this.dirty$ = [];
		return(processed);
	}


	lock(record: Record): Promise<boolean>
	{
		throw new Error("lock not implemented.");
	}


	insert(record: Record): Promise<boolean>
	{
		throw new Error("insert not implemented.");
	}


	update(record: Record): Promise<boolean>
	{
		throw new Error("update not implemented.");
	}


	delete(record: Record): Promise<boolean>
	{
		throw new Error("delete not implemented.");
	}


	refresh(record: Record): Promise<boolean>
	{
		throw new Error("refresh not implemented.");
	}


	public async query(filter?: FilterStructure): Promise<boolean>
	{
		this.fetched$ = [];
		this.nosql$ = null;
		filter = filter?.clone();

		if (!this.jdbconn$.connected())
		{
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

				if (df instanceof SubQuery && df.isClientSide())
				{
					if (this.nosql$ == null)
						this.nosql$ = new FilterStructure(this.name+".nosql");

					details.delete(df);
					this.nosql$.and(df);
					this.addColumns(df.columns);
				}
			}
		}

		await this.createCursor();
		let query:Query = new Query(this,this.columns,filter);

		this.cursor$.query = query;
		this.cursor$.trx = this.jdbconn$.trx;

		query.rows = this.arrayfecth;
		query.orderBy = this.sorting;
		query.cursor = this.cursor$.name;

		let response:any = await this.jdbconn$.send(query);

		this.fetched$ = this.parse(response);
		this.fetched$ = await this.filter(this.fetched$);

		return(true);
	}

	/** Fetch a set of records */
	public async fetch() : Promise<Record[]>
	{
		if (this.cursor$ == null)
			return([]);

		if (this.fetched$.length > 0)
		{
			let fetched:Record[] = [];
			fetched.push(...this.fetched$);

			this.fetched$ = [];
			return(fetched);
		}

		if (this.cursor$.eof)
			return([]);

		let response:any = null;
		let query:Query = this.cursor$.query;

		if (this.jdbconn$.restore(this.cursor$))
		{
			query.skip = query.rows;
			response = await this.jdbconn$.send(query);
		}
		else
		{
			let fetch:CFunc = new CFunc(this.cursor$.name,COPR.fetch);
			response = await this.jdbconn$.send(fetch);
		}

		if (!response.success)
		{
			this.cursor$ = null;
			console.error(this.name+" failed to fetch: "+JSON.stringify(response));
			return([]);
		}

		let fetched:Record[] = this.parse(response);

		fetched = await this.filter(fetched);
		if (fetched.length == 0) return(this.fetch());

		return(fetched);
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

	/** Close the database cursor */
	public async closeCursor() : Promise<boolean>
	{
		let response:any = null;

		if (this.cursor$ && !this.cursor$.eof)
		{
			console.log("close "+this.cursor$.name);
			let cursor:CFunc = new CFunc(this.cursor$.name,COPR.close);
			response = await this.jdbconn$.send(cursor);
		}

		this.fetched$ = [];
		this.cursor$ = null;

		if (response)
			return(response.success);

		return(true);
	}

	private async createCursor() : Promise<void>
	{
		if (this.cursor$ && !this.cursor$.eof)
		{
			if (!await this.closeCursor())
				return;
		}

		this.cursor$ = new Cursor(this.name);
		this.cursor$.rows = this.arrayfecth;
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

		if (!this.order$ && response.order)
			this.order$ = response.order;

		if (this.primary$.length == 0 && response.primarykey)
		{
			let cols:string[] = response.primarykey;

			cols.forEach((col) =>
			{
				col = col.trim();

				if (col.length > 0)
					this.primary$.push(col);
			})
		}

		this.described$ = true;
		return(this.described$);
	}

	private parse(response:any) : Record[]
	{
		let fetched:Record[] = [];
		let rows:any[][] = response.rows;

		if (!response.more)
		{
			if (this.cursor$)
				this.cursor$.eof = true;
		}

		if (!response.success)
		{
			if (this.cursor$)
				this.cursor$.eof = true;

			return(fetched);
		}

		if (!this.cursor$) console.log(new Error().stack)
		this.cursor$.pos += rows.length;

		if (this.primary$ == null)
			this.primary$ = this.columns$;

		let dates:boolean[] = [];
		let datetypes:string[] = ["date", "datetime", "timestamp"];

		for (let c = 0; c < this.columns.length; c++)
		{
			let dt:string = this.datatypes$.get(this.columns[c].toLowerCase());
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
						rows[r][c] = new Date(+rows[r][c]);
				}

				record.setValue(this.columns[c],rows[r][c]);
			}

			let response:any = {succes: true, rows: [rows[r]]};
			record.response = new DatabaseResponse(response,this.columns);

			record.cleanup();
			fetched.push(record);
		}

		return(fetched);
	}

	private castResponse(response:any) : void
	{
		let rows:any[][] = response.rows;

		if (rows == null)
			return;

		let datetypes:string[] = ["date", "datetime", "timestamp"];

		for (let r = 0; r < rows.length; r++)
		{
			Object.keys(rows[r]).forEach((col) =>
			{
				col = col.toLowerCase();
				let value:any = rows[r][col];
				let dt:string = this.datatypes$.get(col);

				if (datetypes.includes(dt) && typeof value === "number")
					rows[r][col] = new Date(value);
			})
		}
	}

	private async process(record:Record, response:any) : Promise<boolean>
	{
		if (!response.success)
		{
			if (response.violations)
			{
				record.locked = true;

				let columns:string = "";
				let violations:any[] = response.violations;

				for (let i = 0; i < violations.length && i < 5; i++)
				{
					if (i > 0) columns += ", ";
					columns += violations[i].column;
				}

				if (violations.length > 5)
					columns += ", ...";

				await record.block.wrapper.refresh(record);
				let row:number = record.block.view.displayed(record)?.rownum;

				if (row != null)
					await record.block.view.refresh(record);

				if (row == null) Messages.warn(MSGGRP.TRX,9,columns); // Record has been changed by another user
				else Messages.warn(MSGGRP.TRX,10,row,columns); // Same but with rownum
			}
			else
			{
				if (response.lock)
				{
					if (response.rows?.length == 0)
					{
						record.state = RecordState.Deleted;
						Messages.warn(MSGGRP.TRX,11); // Record has been deleted by another user
					}
					else
					{
						await record.block.wrapper.refresh(record);
						let row:number = record.block.view.displayed(record)?.rownum;

						if (row != null)
						{
							await record.block.view.refresh(record);
							record.setClean(true);
						}

						// Record is locked by another user
						if (row == null) Messages.warn(MSGGRP.TRX,12);
						else Messages.warn(MSGGRP.TRX,13,row); // with rownum
					}
				}
				else
				{
					let assert:string = response.assert ? " "+response.assert : "";
					Messages.handle(MSGGRP.TRX,response.message+assert,Level.severe);
				}
			}

			record.failed = true;
			record.locked = false;

			return(false);
		}

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