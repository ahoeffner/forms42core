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

import { Response } from "./Response.js";
import { DataType } from "../DataType.js";
import { BindValue } from "../BindValue.js";
import { Connection } from "../Connection.js";
import { Filter } from "../../model/interfaces/Filter.js";
import { Serializable, applyTypes } from "./Serializable.js";
import { FilterStructure } from "../../model/FilterStructure.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

export class Query implements Serializable
{
	private skip$: number = 0;
	private rows$: number = 1;
	private source:string = null;
	private order$:string = null;
	private cursor$:string = null;
	private lock$: boolean = false;
	private columns:string[] = null;
	private response:Response = null;
	private assert:BindValue[] = null;
	private filter:FilterStructure = null;

	private datatypes$:Map<string,DataType|string> =
		new Map<string,string>();

	constructor(source:string, columns:string|string[], filter?:Filter|Filter[]|FilterStructure)
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.source = source;
		this.columns = columns;

		if (filter)
		{
			if (!(filter instanceof FilterStructure))
			{
				if (!Array.isArray(filter)) filter = [filter];

				this.filter = new FilterStructure();
				filter.forEach((flt) => this.filter.and(flt));
			}
			else
			{
				this.filter = filter;
			}
		}
	}

	public get rows() : number
	{
		return(this.rows$);
	}

	public set rows(rows:number)
	{
		this.rows$ = rows;
	}

	public set skip(rows:number)
	{
		this.skip$ = rows;
	}

	public get skip() : number
	{
		return(this.skip$);
	}

	public get cursor() : string
	{
		return(this.cursor$);
	}

	public set cursor(cursor:string)
	{
		this.cursor$ = cursor;
	}

	public get orderBy() : string
	{
		return(this.order$);
	}

	public set orderBy(value:string)
	{
		this.order$ = value;
	}

	public get lock() : boolean
	{
		return(this.lock$);
	}

	public set lock(value:boolean)
	{
		this.lock$ = value;
	}

	public set assertions(assertions:BindValue|BindValue[])
	{
		if (!Array.isArray(assertions))
			assertions = [assertions];

		this.assert = assertions;
	}

	/** Set datatypes */
	public setDataTypes(types:Map<string,DataType|string>) : Query
	{
		if (types) this.datatypes$ = types;
		else this.datatypes$.clear();
		return(this);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		let jsdbconn:Connection = Connection.getConnection(conn);

		let response:any = await jsdbconn.send(this);
		this.response = new Response(this.columns,this.datatypes$);

		return(this.response.parse(response));
	}

	public serialize() : any
	{
		let json:any = {};

		json.request = "query";
		json.source = this.source;
		json.columns = this.columns;

		if (this.skip > 0)
			json.skip = this.skip;

		if (this.rows > 0)
			json.rows = this.rows;

		if (this.cursor)
			json.cursor = this.cursor;

		applyTypes(this.datatypes$,this.assert);
		applyTypes(this.datatypes$,this.filter.getBindValues());

		if (this.filter)
			json.filters = this.filter.serialize().filters;

		let assert:any[] = [];

		for (let i = 0; i < this.assert?.length; i++)
		{
			assert.push
			(
				{
					column: this.assert[i].column,
					value: this.assert[i].value,
					type: this.assert[i].type
				}
			)
		}

		if (this.assert?.length > 0)
			json.assertions = assert;

		if (this.order$)
			json.order = this.order$;

		if (this.lock)
			json.lock = this.lock;

		return(json);
	}
}