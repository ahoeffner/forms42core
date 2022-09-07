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
import { Record, RecordStatus } from "./Record.js";
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
	private filters$:Map<string,QueryFilter> = new Map<string,QueryFilter>();

	constructor(block:Block)
	{
		this.block$ = block;
		this.initialize();
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

	public finalize(structure:FilterStructure) : void
	{
		this.record.columns.forEach((column) =>
		{
			let filter:Filter = null;
			let value = this.record$.getValue(column);
			let qf:QueryFilter = this.filters$.get(column);

			if (value == null)
			{
				if (qf != null)
					this.filters$.delete(column);
			}
			else
			{
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

					structure.and(filter);
				}

				filter.constraint = value;
				console.log("finalize "+filter.constructor.name+" -> "+value)
			}
		})
	}

	private initialize() : void
	{
		console.log("initialize "+this.wrapper$)
		if (this.wrapper$ == null)
		{
			this.table$ = new MemoryTable();
			this.wrapper$ = new DataSourceWrapper();

			this.wrapper$.source = this.table$;
			this.record$ = this.wrapper$.create(0);
			this.record$.status = RecordStatus.QBE;
		}
	}
}

class QueryFilter
{
	private column$:string = null;
	private filter$:Filter|FilterStructure = null;
}