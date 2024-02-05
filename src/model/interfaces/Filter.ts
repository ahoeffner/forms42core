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

import { Record } from "../Record.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";

/**
 * Filters is a key component when communicating with a backend.
 *
 * To write a filter just implement this interface.
 * In most cases extending an existing filter is easier.
 */
export abstract class Filter
{
	abstract clear() : void;
	abstract asSQL() : string;
	abstract clone() : Filter;

	abstract column:string;
	abstract constraint:any|any[];

	abstract getBindValue() : BindValue;
	abstract getBindValues() : BindValue[];

	abstract getBindValueName() : string;
	abstract setBindValueName(name:string) : Filter;

	abstract getDataType() : string;
	abstract setDataType(type:DataType) : Filter;

	abstract setConstraint(value:any|any[]) : Filter;

	abstract evaluate(record:Record) : Promise<boolean>;

	public asJSON() : any
	{
		let json:any = {name: this.constructor.name};

		let bv:any[] = this.convert(this.getBindValues());
		if (bv.length > 0) json.bindvalues = bv;

		return(json);
	}

	public convert(bindv:BindValue[]) : any[]
	{
		let binds:any[] = [];
		if (bindv == null) return([]);

		bindv.forEach((b) =>
		{
			let value:any = b.value;

			if (value instanceof Date)
				value = value.getTime();

			if (b.outtype) binds.push({name: b.name, type: b.type});
			else
			{
				if (value == null) binds.push({name: b.name, type: b.type});
				else binds.push({name: b.name, value: value, type: b.type});
			}
		})

		return(binds);
	}
}