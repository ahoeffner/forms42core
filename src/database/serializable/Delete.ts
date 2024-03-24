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

import { DataType } from "../DataType.js";
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { Response, Violation } from "./Response.js";
import { BindValue, applyTypes } from "../BindValue.js";
import { Filter } from "../../model/interfaces/Filter.js";
import { FilterStructure } from "../../model/FilterStructure.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

export class Delete implements Serializable
{
	private source$:string = null;
	private retcols$:string[] = null;
	private response$:Response = null;
	private assert$:BindValue[] = null;
	private filter$:FilterStructure = null;

	private datatypes$:Map<string,DataType|string> =
		new Map<string,DataType|string>();


	constructor(source:string, filter?:Filter|Filter[]|FilterStructure, retcols?:string|string[], types?:Map<string,DataType|string>)
	{
		if (!retcols)
			retcols = [];

		if (!Array.isArray(retcols))
			retcols = [retcols];

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

		this.source$ = source;
		this.retcols$ = retcols;
		this.datatypes$ = types;
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

	/** Assert that columns hasn't been changed */
	public set assertions(assert:BindValue|BindValue[])
	{
		if (!Array.isArray(assert))
			assert = [assert];

		this.assert$ = assert;
	}

	/** Set datatypes */
	public setDataTypes(types:Map<string,DataType|string>) : Delete
	{
		if (types) this.datatypes$ = types;
		else this.datatypes$.clear();
		return(this);
	}

	/** Get assertion violations */
	public get violations() : Violation[]
	{
		return(this.response$.violations);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		let jdbconn:Connection = Connection.getConnection(conn);

		let response:any = await jdbconn.send(this);
		this.response$ = new Response(null,this.datatypes$);
		let success:boolean = this.response$.parse(response);

		return(success);
	}

	public serialize() : any
	{
		let json:any = {};
		json.request = "delete";
		json.source = this.source$;

		if (this.filter$)
			json.filters = this.filter$.serialize().filters;

		let assert:any[] = [];

		applyTypes(this.datatypes$,this.assert$);
		applyTypes(this.datatypes$,this.filter$.getBindValues());

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

		let retcols:any[] = [];

		if (this.retcols$.length > 0)
		{
			this.retcols$.forEach((col) =>
			{
				let type:DataType|string = this.datatypes$.get(col);
				if (!(typeof type === "string")) type = DataType[type];

				let rcol:any = {column: col};
				if (type) rcol.type = type;

				retcols.push(rcol);
			})

			json.returning = retcols;
		}

		return(json);
	}
}