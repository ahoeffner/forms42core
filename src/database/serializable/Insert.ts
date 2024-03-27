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
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { BindValue, applyTypes } from "../BindValue.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

export class Insert implements Serializable
{
	private source$:string = null;
	private retcols$:string[] = null;
	private response$:Response = null;

	private values$:Map<string,BindValue> =
		new Map<string,BindValue>();

	private datatypes$:Map<string,DataType|string> =
		new Map<string,string>();


	constructor(source:string, values:BindValue|BindValue[], retcols?:string|string[], types?:Map<string,DataType|string>)
	{
		if (!retcols)
			retcols = [];

		if (!Array.isArray(values))
			values = [values];

		if (!Array.isArray(retcols))
			retcols = [retcols];

		values.forEach((value) =>
			this.values$.set(value.name,value));

		this.source$ = source;
		this.retcols$ = retcols;
		this.datatypes$ = types;
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

	/** Set datatypes */
	public setDataTypes(types:Map<string,DataType|string>) : Insert
	{
		if (types) this.datatypes$ = types;
		else this.datatypes$.clear();
		return(this);
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
		json.request = "insert";
		json.source = this.source$;

		let cols:any[] = [];
		applyTypes(this.datatypes$,this.values$);

		this.values$.forEach((value) =>
		{
			cols.push
			(
				{
					column: value.column,
					value: value.serialize()
				}
			)
		})

		json.values = cols;

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