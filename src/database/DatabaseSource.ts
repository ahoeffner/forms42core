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

import { Query } from "./serializable/Query.js";
import { Batch } from "./serializable/Batch.js";
import { MSGGRP } from "../messages/Internal.js";
import { Insert } from "./serializable/Insert.js";
import { Delete } from "./serializable/Delete.js";
import { Update } from "./serializable/Update.js";
import { LockMode, SQLSource } from "./SQLSource.js";
import { Describe } from "./serializable/Describe.js";
import { Filters } from "../model/filters/Filters.js";
import { Connection } from "../database/Connection.js";
import { Filter } from "../model/interfaces/Filter.js";
import { BindValue, applyTypes } from "./BindValue.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { Record, RecordState } from "../model/Record.js";
import { DatabaseResponse } from "./DatabaseResponse.js";
import { Level, Messages } from "../messages/Messages.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";


/**
 * Datasource based on a table/view/... using OpenJsonDB
 */
export class DatabaseSource extends SQLSource implements DataSource
{
	private query$:Query = null;
	private order$:string = null;
	private source$:string = null;

	private described$:boolean = false;

	private jdbconn$:Connection = null;
	private pubconn$:DatabaseConnection = null;

	private dirty$:Record[] = [];

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
	public constructor(source:string, columns?:string|string[])
	{
		super();

		if (columns != null)
		{
			if (!Array.isArray(columns))
				columns = [columns];

			this.columns$ = columns;
		}

		this.name = source;
		this.source$ = source;
	}

	/** Get the source */
	public get source() : string
	{
		return(this.source$);
	}

	/** Set the source */
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

	/** Gets the connection */
	public get connection() : DatabaseConnection
	{
		return(this.pubconn$);
	}

	/** Sets the connection */
	public set connection(connection:DatabaseConnection)
	{
		this.pubconn$ = connection;
		this.jdbconn$ = Connection.getConnection(connection);
	}

	/** Get the primary key defined for this datasource */
	public get primaryKey() : string[]
	{
		if (this.primary$ == null) return(this.columns)
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
		this.close();
	}

	/** Clones this datasource */
	public clone() : DatabaseSource
	{
		let clone:DatabaseSource = new DatabaseSource(this.source$);

		clone.name = this.name;
		clone.sorting = this.sorting;
		clone.primary$ = this.primary$;
		clone.columns$ = this.columns$;
		clone.connection = this.pubconn$,
		clone.described$ = this.described$;
		clone.arrayfecth = this.arrayfecth;
		clone.datatypes$ = this.datatypes$;

		clone.insertReturnColumns = this.insertReturnColumns;
		clone.updateReturnColumns = this.updateReturnColumns;
		clone.deleteReturnColumns = this.deleteReturnColumns;

		return(clone);
	}

	/** Undo not flushed changes */
	public async undo() : Promise<Record[]>
	{
		let undo:Record[] = [];

		for (let i = 0; i < this.dirty$.length; i++)
		{
			this.dirty$[i].refresh();
			undo.push(this.dirty$[i]);
		}

		return(undo);
	}

	/** Flush changes to backend */
	public async flush() : Promise<Record[]>
	{
		let processed:Record[] = [];
		let batch:Batch = new Batch();

		if (!this.jdbconn$?.connected())
		{
			Messages.severe(MSGGRP.JWDB,3,this.constructor.name);
			return([]);
		}

		if (this.dirty$.length == 0)
			return([]);

		if (!await this.describe())
			return([]);

		let columns:string[] =
			this.mergeColumns(this.columns,this.dmlcols$);

		for (let i = 0; i < this.dirty$.length; i++)
		{
			let assert:boolean = true;

			if (this.rowlocking == LockMode.None)
				assert = false;

			let record:Record = this.dirty$[i];

			if (record.locked)
				assert = false;

			if (record.failed)
				continue;

			if (record.state == RecordState.Insert)
			{
				processed.push(record);
				record.response = null;

				let values:BindValue[] = this.bind(record,columns);
				let ins:Insert = new Insert(this.source,values,this.insreturncolumns$,this.datatypes$);

				batch.add(ins);
			}

			else

			if (record.state == RecordState.Delete)
			{
				processed.push(record);
				record.response = null;

				let pkeyflt:FilterStructure = this.getPrimarykeyFilter(record);
				let del:Delete = new Delete(this.source,pkeyflt,this.delreturncolumns$,this.datatypes$);

				if (assert) del.assertions = this.assert(record);
				batch.add(del);
			}

			else

			if (record.state != RecordState.Deleted)
			{
				// Might have been marked clean
				if (!record.dirty) continue;

				processed.push(record);
				record.response = null;

				let changes:BindValue[] = this.bind(record,record.getDirty());
				let pkeyflt:FilterStructure = this.getPrimarykeyFilter(record);
				let upd:Update = new Update(this,changes,pkeyflt,this.updreturncolumns$,this.datatypes$);

				if (assert) upd.assertions = this.assert(record);
				batch.add(upd);
			}
		}

		let success:boolean = await batch.execute(this.connection);

		if (!success)
		{
			Messages.severe(MSGGRP.JWDB,5,batch.error());
			return([]);
		}

		batch.getResponses().forEach((resp) =>
		{
			console.log(resp.response)
		})

		this.dirty$ = [];
		return(processed);
	}

	/** Lock the given record in the database */
	public async lock(record: Record): Promise<boolean>
	{
		if (record.locked)
			return(true);

		if (this.rowlocking == LockMode.None)
			return(true);

		if (!await this.describe())
			return(false);

		let columns:string[] =
			this.mergeColumns(this.columns,this.dmlcols$);

		let pkeyflt:FilterStructure = this.getPrimarykeyFilter(record);
		let lock:Query = new Query(this.source,columns,pkeyflt);

		lock.lock = true;
		lock.assertions = this.assert(record);

		let success:boolean = await lock.execute(this.pubconn$);

		if (!success)
		{
			// Unable to lock row
			Messages.severe(MSGGRP.SQL,3,this.source$,lock.message);
			return(false);
		}

		return(success);
	}

	/** Create a record for inserting a row in the table/view */
	public async insert(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	/** Mark a record for updating a row in the table/view */
	public async update(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	/** Mark a record for deleting a row in the table/view */
	public async delete(record:Record) : Promise<boolean>
	{
		if (!this.dirty$.includes(record))
			this.dirty$.push(record);
		return(true);
	}

	/** Re-fetch the given record from the backend */
	public async refresh(record:Record) : Promise<boolean>
	{
		record.refresh();

		let pkeyflt:FilterStructure = this.getPrimarykeyFilter(record);
		let refr:Query = new Query(this.source,this.columns,pkeyflt);
		let success:boolean = await refr.execute(this.connection);

		if (!success)
		{
			Messages.handle(MSGGRP.SQL,refr.error(),Level.warn);
			return(false);
		}

		let fetched:Record[] = [];
		let records:any[][] = await refr.fetch();

		for (let r = 0; r < records.length; r++)
		{
			let record:Record = new Record(this);

			for (let c = 0; c < record[r].length; c++)
				record.setValue(this.columns[c],record[r][c]);

			record.cleanup();
			fetched.push(record);
		}

		if (fetched.length == 0)
		{
			record.state = RecordState.Delete;
			Messages.warn(MSGGRP.SQL,1); // Record has been deleted
			return(false);
		}

		for (let i = 0; i < this.columns.length; i++)
		{
			let nv:any = fetched[0].getValue(this.columns[i]);
			record.setValue(this.columns[i],nv)
		}

		record.state = RecordState.Consistent;
		return(true);
	}

	/** Execute the query */
	public async query(filter?: FilterStructure): Promise<boolean>
	{
		this.nosql$ = null;
		filter = filter?.clone();

		if (!this.jdbconn$?.connected())
		{
			Messages.severe(MSGGRP.JWDB,3,this.constructor.name);
			return(false);
		}

		if (!await this.describe())
			return(false);

		if (this.limit$ != null)
		{
			if (!filter) filter = this.limit$;
			else filter.and(this.limit$,"limit");
		}

		applyTypes(this.datatypes$,filter?.get("qbe")?.getBindValues());
		applyTypes(this.datatypes$,filter?.get("limit")?.getBindValues());
		applyTypes(this.datatypes$,filter?.get("masters")?.getBindValues());

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

		if (this.query$)
			this.query$.close();

		this.query$ = new Query(this.source,this.columns,filter);

		this.query$.orderBy = this.order$;
		this.query$.arrayfetch = this.arrayfecth;
		await this.query$.execute(this.connection);

		return(true);
	}

	/** Fetch a set of records */
	public async fetch() : Promise<Record>
	{
		if (!this.query$.more())
			return(null);

		let row:any[] = await this.query$.fetch();
		if (!row) return(null);

		let record:Record = new Record(this);

		for (let c = 0; c < row.length; c++)
			record.setValue(this.columns[c],row[c]);

		record.cleanup();

		if (this.nosql$ && !await this.nosql$.evaluate(record))
			return(this.fetch());

		return(record);
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
	public async close() : Promise<boolean>
	{
		this.query$?.close();
		return(true);
	}

	private async describe() : Promise<boolean>
	{
		if (this.described$)
			return(true);

		if (!this.jdbconn$?.connected())
		{
			Messages.severe(MSGGRP.JWDB,3,this.constructor.name);
			return(false);
		}

		let desc:Describe = new Describe(this.source);
		let success:boolean = await desc.execute(this.pubconn$);

		if (!success)
		{
			// Unable to get column definitions
			Messages.warn(MSGGRP.SQL,3,this.source$,desc.message);
			return(false);
		}

		let columns:string[] = desc.columns;

		for (let i = 0; i < columns.length; i++)
		{
			columns[i] = columns[i].toLowerCase();

			let type:string = desc.types[i];
			let datatype:string = type.toLowerCase();
			this.datatypes$.set(columns[i],datatype);
		}

		if (!this.order$ && desc.order)
			this.order$ = desc.order;

		if (this.primary$.length == 0 && desc.primarykey)
		{
			let cols:string[] = desc.primarykey;

			cols.forEach((col) =>
			{
				col = col.trim();

				if (col.length > 0)
					this.primary$.push(col);
			})
		}

		this.described$ = true;
		console.log("cache describe");
		return(this.described$);
	}

	private assert(record:Record) : BindValue[]
	{
		let asserts:BindValue[] = [];

		this.columns.forEach((col) =>
		{
			let type:string = this.datatypes$.get(col);
			let value:any = record.getInitialValue(col);
			asserts.push(new BindValue(col,value,type));
		})

		return(asserts);
	}

	private bind(record:Record, columns:string[]) : BindValue[]
	{
		let bindvals:BindValue[] = [];

		if (columns == null)
			return(bindvals);

		for (let i = 0; i < columns.length; i++)
		{
			let type:string = this.datatypes$.get(columns[i]);
			bindvals.push(new BindValue(columns[i],record?.getValue(columns[i]),type));
		}

		return(bindvals);
	}

	private getPrimarykeyFilter(record:Record) : FilterStructure
	{
		let pkey:string[] = this.primaryKey;
		let pkeyflt:FilterStructure = new FilterStructure();

		if (this.primaryKey.length == 0)
			pkey = this.columns$;

		for (let i = 0; i < pkey.length; i++)
		{
			let filter:Filter = Filters.Equals(pkey[i]);
			let value:any = record.getInitialValue(pkey[i]);
			pkeyflt.and(filter.setConstraint(value),pkey[i]);
			applyTypes(this.datatypes$,filter.getBindValues());
		}

		return(pkeyflt);
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