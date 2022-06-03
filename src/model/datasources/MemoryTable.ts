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

import { Record } from "../Record.js";
import { Block } from "../../public/Block.js";
import { Filter } from "../interfaces/Filter.js";
import { DataSource } from "../interfaces/DataSource.js";
import { EventType } from "../../control/events/EventType.js";
import { FormEvent, FormEvents } from "../../control/events/FormEvents.js";

export class MemoryTable implements DataSource
{
	private pos$:number = 0;
	private rows$:number = -1;
	private block$:Block = null;
	private records:Record[] = [];
	private filters:Filter[] = [];
	private cursor:Record[] = null;
	private inserted$:Record[] = [];

	public arrayfecth:number = 1;

	public queryable:boolean  = true;
	public insertable:boolean = true;
	public updateable:boolean = true;
	public deleteable:boolean = true;


	constructor(block:Block, records?:Record[])
	{
		if (records == null)
			records = [];

		this.block$ = block;
		this.records = records;
	}

	public set maxrows(rows:number)
	{
		this.rows$ = rows;
	}

	public getFilters() : Filter[]
	{
		return(this.filters);
	}

	public addFilter(filter:Filter) : void
	{
		this.filters.push(filter);
	}

	public setFilters(filters:Filter[]) : void
	{
		this.filters = filters;
	}

	public async lock(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async post() : Promise<boolean>
	{
		return(true);
	}

	public async refresh(record:Record) : Promise<Record>
	{
		return(record);
	}

	public async delete(record:Record) : Promise<boolean>
	{
		if (!this.deleteable) return(false);

		let rec:number = this.indexOf(this.records,record.id);
		let ins:number = this.indexOf(this.inserted$,record.id);

		if (ins >= 0)
			delete this.inserted$[ins];

		if (rec >= 0)
		{
			if (!await this.fire(EventType.PreDelete))
				return(false);

			delete this.records[rec];
			return(await this.fire(EventType.PostDelete));
		}

		return(ins >= 0 || rec >= 0);
	}

	public async insert(record:Record) : Promise<boolean>
	{
		if (!this.insertable)
			return(false);

		if (this.rows$ > 0 && this.records.length >= this.rows$)
			return(null);

		if (!await this.fire(EventType.PreInsert))
			return(false);

		if (!await this.fire(EventType.PostInsert))
			return(false);

		this.inserted$.push(record);
		return(true);
	}

	public async update(_record:Record) : Promise<boolean>
	{
		if (!this.updateable) return(false);

		if (!await this.fire(EventType.PreUpdate))
			return(false);

		return(await this.fire(EventType.PostUpdate));
	}

	public async fetch() : Promise<Record[]>
	{
		let cursor:Record[] = this.cursor;
		if (cursor == null) cursor = this.records;
		return([cursor[this.pos$++]]);
	}

	public async query() : Promise<boolean>
	{
		if (!this.queryable) return(false);
		this.records.push(...this.inserted$);
		this.cursor = this.records;
		return(true);
	}

	public closeCursor(): void
	{
		this.cursor = null;
	}

	private async fire(type:EventType) : Promise<boolean>
	{
		return(FormEvents.raise(FormEvent.newBlockEvent(type,this.block$.form,this.block$.name)));
	}

	private indexOf(records:Record[],oid:any) : number
	{
		for (let i = 0; i < records.length; i++)
		{
			if (records[i].id == oid)
				return(i);
		}

		return(-1);
	}
}