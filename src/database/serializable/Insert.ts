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
import { BindValue } from "../BindValue.js";
import { Connection } from "../Connection.js";
import { Serializable, applyTypes } from "./Serializable.js";
import { DataSource } from "../../model/interfaces/DataSource.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

export class Insert implements Serializable
{
	private retcols:string[] = null;
	private source:DataSource = null;

	private values:Map<string,BindValue> =
		new Map<string,BindValue>();

	private rettypes:Map<string,BindValue> =
		new Map<string,BindValue>();

	private datatypes$:Map<string,DataType|string> =
		new Map<string,string>();


	constructor(source:DataSource, values:BindValue|BindValue[], retcols?:string|string[], rettypes?:BindValue|BindValue[])
	{
		if (!retcols)
			retcols = [];

		if (!Array.isArray(values))
			values = [values];

		if (!Array.isArray(retcols))
			retcols = [retcols];

		if (!Array.isArray(rettypes))
			rettypes = [rettypes];

		this.source = source;
		this.retcols = retcols;

		values.forEach((value) =>
			this.values.set(value.name,value));

		rettypes.forEach((type) =>
			this.rettypes.set(type.name,type));
	}

	/** Set datatypes */
	public setDataTypes(types:Map<string,DataType|string>) : Insert
	{
		if (types) this.datatypes$ = types;
		else this.datatypes$.clear();
		return(this);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<any>
	{
		let jsdbconn:Connection = Connection.getConnection(conn);
		return(jsdbconn.send(this));
	}

	public serialize() : any
	{
		let json:any = {};
		json.request = "insert";
		json.source = this.source.name;

		let cols:any[] = [];

		applyTypes(this.datatypes$,this.values);
		applyTypes(this.datatypes$,this.rettypes);

		this.values.forEach((value) =>
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

		if (this.retcols.length > 0)
		{
			this.retcols.forEach((col) =>
			{
				let val:BindValue = this.rettypes.get(col);

				let rcol:any = {column: col};
				if (val) rcol.type = val.type;

				retcols.push(rcol);
			})

			json.returning = retcols;
		}

		return(json);
	}
}