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
import { Serializable } from "./Serializable.js";
import { DataSource } from "../../model/interfaces/DataSource.js";

export class Insert implements Serializable
{
	private columns:string[] = null;
	private retcols:string[] = null;
	private source:DataSource = null;
	private values:BindValue[] = null;


	constructor(source:DataSource, columns:string|string[], values:BindValue|BindValue[], retcols?:string|string[])
	{
		if (!retcols)
			retcols = [];

		if (!Array.isArray(values))
			values = [values];

		if (!Array.isArray(columns))
			columns = [columns];

		if (!Array.isArray(retcols))
			retcols = [retcols];

		this.source = source;
		this.values = values;
		this.columns = columns;
		this.retcols = retcols;
	}

	public serialize() : any
	{
		let json:any = {};
		json.object = "Create";
		json.source = this.source.name;

		let values:Map<string,BindValue> =
			new Map<string,BindValue>();

		this.values.forEach((val) =>
			values.set(val.column,val));

		let cols:any[] = [];

		this.columns.forEach((col) =>
		{
			let val:BindValue = values.get(col);
			if (!val) val = new BindValue(col,null,DataType.string);
			values.delete(col);

			cols.push(
				{
					column: col,
					value: val.serialize()
				}
			)
		})

		json.values = cols;

		let types:BindValue[] = [];

		values.forEach((val,col) =>
		{types.push(val.serialize())})

		if (types.length > 0)
			json.types = types;

		if (this.retcols.length > 0)
			json.returning = this.retcols;

		return(json);
	}
}