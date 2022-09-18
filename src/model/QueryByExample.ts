/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

import { Block } from "./Block.js";
import { Filters } from "./filters/Filters.js";
import { Filter } from "./interfaces/Filter.js";
import { Record, RecordState } from "./Record.js";
import { DataType } from "../view/fields/DataType.js";
import { FilterStructure } from "./FilterStructure.js";
import { MemoryTable } from "./datasources/MemoryTable.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";


export class QueryByExample
{
	private block$:Block = null;
	private record$:Record = null;
	private qmode$:boolean = false;
	private table$:MemoryTable = null;
	private wrapper$:DataSourceWrapper = null;
	private filter$:FilterStructure = new FilterStructure();
	private lastqry$:Map<string,QueryFilter> = new Map<string,QueryFilter>();

	constructor(block:Block)
	{
		this.block$ = block;
		this.table$ = new MemoryTable();
		this.wrapper$ = new DataSourceWrapper();

		this.wrapper$.block = block;
		this.wrapper$.source = this.table$;
		this.record$ = this.wrapper$.create(0);
		this.record$.state = RecordState.QueryFilter;
	}

	public get querymode() : boolean
	{
		return(this.qmode$);
	}

	public set querymode(flag:boolean)
	{
		this.qmode$ = flag;
	}

	public clear() : void
	{
		this.qmode$ = false;
		this.lastqry$.clear();

		this.record$.values.forEach((column) =>
		{
			let qf:QueryFilter = new QueryFilter(column.value,this.filter$.get(column.name));
			this.lastqry$.set(column.name,qf);
		})

		this.filter$.clear();
		this.record$?.clear();
	}

	public showLastQuery() : void
	{
		this.lastqry$.forEach((qf,column) =>
		{
			this.record$.setValue(column,qf.value);
			this.setFilter(column,qf.filter);
		})
	}

	public get record() : Record
	{
		return(this.record$);
	}

	public get wrapper() : DataSourceWrapper
	{
		return(this.wrapper$);
	}

	public get QBEFilter() : FilterStructure
	{
		return(this.filter$);
	}

	public setFilter(column:string, filter?:Filter|FilterStructure) : void
	{
		if (filter == null)
			filter = this.getDefaultFilter(column);

		if (filter == null) 	this.filter$.delete(filter);
		else						this.filter$.and(filter,column);
	}

	public getDefaultFilter(column:string) : Filter
	{
		let filter:Filter = null;
		let value = this.record$.getValue(column);

		if (value == null)
			return(null);

		switch(this.block$.view.fieldinfo.get(column).type)
		{
			case DataType.date 		: filter = Filters.Like(column); break;
			case DataType.datetime 	: filter = Filters.Like(column); break;
			case DataType.string 	: filter = Filters.Like(column); break;
			case DataType.integer 	: filter = Filters.Equals(column); break;
			case DataType.decimal 	: filter = Filters.Equals(column); break;
		}

		filter.constraint = value;
		return(filter);
	}
}

class QueryFilter
{
	constructor(public value:any, public filter:Filter|FilterStructure) {}
}