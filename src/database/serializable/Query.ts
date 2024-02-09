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

import { BindValue } from "../BindValue.js";
import { Serializable } from "./Serializable.js";
import { Filter } from "../../model/interfaces/Filter.js";
import { FilterStructure } from "../../model/FilterStructure.js";
import { DataSource } from "../../model/interfaces/DataSource.js";

export class Query implements Serializable
{
	private order:any = null;
	private columns:string[] = null;
	private source:DataSource = null;
	private bindings$:BindValue[] = null;
	private filter:FilterStructure = null;

	constructor(source:DataSource, columns:string|string[], filter?:Filter|Filter[]|FilterStructure, order?:any, bindings?:BindValue[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.order = order;
		this.source = source;
		this.columns = columns;
		this.bindings = bindings;

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

	public get bindings() : BindValue[]
	{
		return this.bindings$;
	}

	public set bindings(value:BindValue[])
	{
		this.bindings$ = value;
	}

	public serialize() : any
	{
		let json:any = {};

		json.object = "Retrieve";
		json.columns = this.columns;
		json.source = this.source.name;

		if (this.bindings$?.length > 0)
		{
			let binding:any[] = [];
			this.bindings$.forEach((b) => binding.push(b.serialize()));
			json.bindings = binding;
		}

		if (this.filter)
			json.filters = this.filter.serialize().filters;

		if (this.order)
			json.order = this.order;

		return(json);
	}
}