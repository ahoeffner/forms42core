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
import { Record } from "./Record.js";
import { Filter } from "./interfaces/Filter.js";
import { MemoryTable } from "./datasources/MemoryTable.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";
import { DataType } from "../view/fields/DataType.js";
import { Filters } from "./filters/Filters.js";
import { FilterGroup } from "./FilterGroup.js";

export class QueryByExample
{
	private block$:Block = null;
	private record$:Record = null;
	private qmode$:boolean = false;
	private table$:MemoryTable = null;
	private wrapper$:DataSourceWrapper = null;
	private filters$:Map<string,QueryFilter> = new Map<string,QueryFilter>();

	constructor(block:Block)
	{
		this.block$ = block;
	}

	public get querymode() : boolean
	{
		return(this.qmode$);
	}

	public set querymode(flag:boolean)
	{
		this.qmode$ = flag;
		if (flag) this.initialize();
	}

	public clear() : void
	{
		this.record$?.clear();
	}

	public get record() : Record
	{
		return(this.record$);
	}

	public get wrapper() : DataSourceWrapper
	{
		return(this.wrapper$);
	}

	public finalize() : FilterGroup
	{
		let group:FilterGroup = new FilterGroup();

		this.record.columns.forEach((column) =>
		{
			let filter:Filter = null;
			let qf:QueryFilter = this.filters$.get(column);

			if (qf == null)
			{
				switch(this.block$.view.fieldinfo.get(column).type)
				{
					case DataType.date 		: filter = Filters.Like(column); break;
					case DataType.datetime 	: filter = Filters.Like(column); break;
					case DataType.string 	: filter = Filters.Like(column); break;
					case DataType.integer 	: filter = Filters.Equals(column); break;
					case DataType.decimal 	: filter = Filters.Equals(column); break;
				}

				group.and(filter);
			}

			console.log(column+" -> "+this.record.getValue(column)+" filter: "+filter)
		})

		return(group);
	}

	private initialize() : void
	{
		if (this.wrapper$ == null)
		{
			this.table$ = new MemoryTable();
			this.wrapper$ = new DataSourceWrapper();

			this.wrapper$.source = this.table$;
			this.record$ = this.wrapper$.create(0);
		}

		this.wrapper.columns = [];
	}
}

class QueryFilter
{
	private column$:string = null;
	private filter$:Filter = null;
}