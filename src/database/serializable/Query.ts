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

import { Cursor } from "../Cursor.js";
import { DataType } from "../DataType.js";
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { Response, Violation } from "./Response.js";
import { MSGGRP } from "../../messages/Internal.js";
import { Messages } from "../../messages/Messages.js";
import { BindValue, applyTypes } from "../BindValue.js";
import { Filter } from "../../model/interfaces/Filter.js";
import { FilterStructure } from "../../model/FilterStructure.js";
import { Cursor as CFunc, CursorRequest as COPR } from "./Cursor.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

export class Query implements Serializable
{
	private pos$:number = 0;
	private skip$: number = 0;
	private order$:string = null;
	private source$:string = null;
	private lock$:boolean = false;
	private cursor$:Cursor = null;
	private records$:any[][] = null;
	private arrayfetch$: number = 32;
	private columns$:string[] = null;
	private response$:Response = null;
	private assert$:BindValue[] = null;
	private jdbconn$:Connection = null;
	private filter$:FilterStructure = null;

	private bindvalues$:Map<string,BindValue> =
		new Map<string,BindValue>();

	private datatypes$:Map<string,DataType|string> =
		new Map<string,string>();

		
	constructor(source:string, columns:string|string[], filter?:Filter|Filter[]|FilterStructure)
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.source$ = source;
		this.columns$ = columns;

		if (filter)
		{
			if (!(filter instanceof FilterStructure))
			{
				if (!Array.isArray(filter)) filter = [filter];

				this.filter$ = new FilterStructure();
				filter.forEach((flt) => this.filter$.and(flt));
			}
			else
			{
				this.filter$ = filter;
			}
		}
	}

	/** If everything okay */
	public get success() : boolean
	{
		return(this.response$.success);
	}

	/** If something went wrong */
	public failed() : boolean
	{
		return(this.response$.failed);
	}

	/** The error (message) from the backend */
	public error() : string
	{
		return(this.response$.message);
	}

	/** The message from the backend */
	public message() : string
	{
		return(this.response$.message);
	}

	/** Get parsed response */
	public response() : Response
	{
		return(this.response$);
	}

	/** The number of rows to fetch from a select-statement per call to fetch */
	public get arrayfetch() : number
	{
		return(this.arrayfetch$);
	}

	/** The number of rows to fetch from a select-statement per call to fetch */
	public set arrayfetch(rows:number)
	{
		this.arrayfetch$ = rows;
	}

	/** Skip rows */
	public set skiprows(rows:number)
	{
		this.skip$ = rows;
	}

	/** Skip rows */
	public get skiprows() : number
	{
		return(this.skip$);
	}

	/** Order by clause */
	public get orderBy() : string
	{
		return(this.order$);
	}

	/** Order by clause */
	public set orderBy(value:string)
	{
		this.order$ = value;
	}

	/** Lock record */
	public get lock() : boolean
	{
		return(this.lock$);
	}

	/** Lock record */
	public set lock(value:boolean)
	{
		this.lock$ = value;
	}

	/** Add extra bindvalues */
	public setBindValue(name:string, value:any, type:DataType|string) : Query
	{
		this.bindvalues$.set(name.toLowerCase(),new BindValue(name,value,type));
		return(this);
	}

	/** Add extra bindvalues */
	public setBindValues(bindvalues:Map<string,BindValue>) : Query
	{
		this.bindvalues$.clear();
		bindvalues.forEach((bind,name) =>
		{this.bindvalues$.set(name.toLowerCase(),bind);})
		return(this);
	}

	/** Bind datatype */
	public setDataType(name:string, type?:DataType|string) : Query
	{
		this.datatypes$.set(name,type);
		return(this);
	}

	/** Set datatypes */
	public setDataTypes(types:Map<string,DataType|string>) : Query
	{
		if (types) this.datatypes$ = types;
		else this.datatypes$.clear();
		return(this);
	}

	/** Set assertions */
	public set assertions(assertions:BindValue|BindValue[])
	{
		if (!Array.isArray(assertions))
			assertions = [assertions];

		this.assert$ = assertions;
	}

	/** Get assertion violations */
	public get violations() : Violation[]
	{
		return(this.response$.violations);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		this.cursor$ = new Cursor(this.source$);
		this.jdbconn$ = Connection.getConnection(conn);

		this.pos$ = 0;
		this.cursor$.trx = this.jdbconn$.trx;

		let response:any = await this.jdbconn$.send(this);
		this.response$ = new Response(this.columns$,this.datatypes$);

		let success:boolean = this.response$.parse(response);

		if (success)
			this.records$ = this.response$.records;

		return(success);
	}

	/** More rows */
	public more() : boolean
	{
		return(this.pos$ < this.records$.length || !this.cursor$.eof);
	}

	/** Fetch next record */
	public async fetch() : Promise<any[]>
	{
		if (!this.cursor$)
		{
			Messages.severe(MSGGRP.JWDB,4,this.source$);
			return(null);
		}

		if (!this.response$.more && this.cursor$)
			this.cursor$.eof = true;

		if (this.records$.length > this.pos$)
			return(this.records$[this.pos$++]);

		if (this.cursor$.eof)
			return(null);

		if (this.jdbconn$.restore(this.cursor$))
		{
			this.skiprows += this.cursor$.pos;

			let response:any = await this.jdbconn$.send(this);
			this.response$ = new Response(this.columns$,this.datatypes$);

			this.cursor$.trx = this.jdbconn$.trx;
			let success:boolean = this.response$.parse(response);

			if (success)
			{
				this.records$ = this.response$.records;
				return(this.fetch());
			}
			else
			{
				return(null);
			}
		}

		let fetch:CFunc = new CFunc(this.cursor$.name,COPR.fetch);

		let response:any = await this.jdbconn$.send(fetch);
		let success:boolean = this.response$.parse(response);

		if (!success)
			return(null);

		this.records$ = this.response$.records;
		return(this.fetch());
	}

	/** Close cursor */
	public async close() : Promise<boolean>
	{
		if (this.cursor$ != null && !this.cursor$.eof)
		{
			if (this.cursor$.trx == this.jdbconn$.trx)
			{
				let cursor:CFunc = new CFunc(this.cursor$.name,COPR.close);
				this.jdbconn$.send(cursor); // No reason to wait
			}
		}

		this.cursor$ = null;
		return(true);
	}

	public serialize() : any
	{
		let json:any = {};

		json.request = "query";
		json.source = this.source$;
		json.columns = this.columns$;

		if (this.skiprows > 0)
			json.skip = this.skiprows;

		if (this.arrayfetch > 0)
			json.rows = this.arrayfetch;

		if (!this.cursor$)
			this.cursor$ = new Cursor(this.source$);

		json.cursor = this.cursor$.name;

		applyTypes(this.datatypes$,this.assert$);
		applyTypes(this.datatypes$,this.bindvalues$);
		applyTypes(this.datatypes$,this.filter$.getBindValues());

		if (this.filter$)
			json.filters = this.filter$.serialize().filters;

		if (this.bindvalues$.size > 0)
		{
			json.bindvalues = [];
			this.bindvalues$.forEach((bind) => json.bindvalues.push(bind.serialize()));
		}

		let assert:any[] = [];

		for (let i = 0; i < this.assert$?.length; i++)
		{
			assert.push
			(
				{
					column: this.assert$[i].column,
					value: this.assert$[i].value,
					type: this.assert$[i].type
				}
			)
		}

		if (this.assert$?.length > 0)
			json.assertions = assert;

		if (this.order$)
			json.order = this.order$;

		if (this.lock)
			json.lock = this.lock;

		return(json);
	}
}