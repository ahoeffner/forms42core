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

import { Block } from "../../public/Block.js";
import { Record } from "../interfaces/Record.js";
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
		let cur:number = this.indexOf(this.cursor,record.id);
		let rec:number = this.indexOf(this.records,record.id);

		if (rec < 0) return(false);

		if (!await this.fire(EventType.PreDelete))
		{
			return(false);
		}

		delete this.records[rec];
		if (cur >= 0) delete this.cursor[cur];

		let outcome:boolean = await this.fire(EventType.PostDelete);

		return(outcome);
	}

	public async insert(record:Record) : Promise<Record>
	{
		if (!this.insertable)
			return(null);

		if (this.records == null)
			this.records = [];

		if (this.rows$ > 0 && this.records.length >= this.rows$)
			return(null);

		let cur:number = 0;
		let rec:number = 0;

		if (record.id != null)
		{
			cur = this.indexOf(this.cursor,record.id);
			rec = this.indexOf(this.records,record.id);
		}

		if (cur < 0) cur = 0;
		if (rec < 0) rec = 0;

		if (!await this.fire(EventType.PreInsert))
		{
			return(null);
		}

		if (!await this.fire(EventType.PostInsert))
		{
			return(null);
		}

		let ins:Record = new Record();
		this.records.splice(rec,0,ins);

		if (this.cursor != null)
			this.cursor.splice(cur,0,ins);

		return(ins);
	}

	public async update(record:Record) : Promise<boolean>
	{
		if (!this.updateable) return(false);
		let cur:number = this.indexOf(this.cursor,record.id);
		let rec:number = this.indexOf(this.records,record.id);

		if (rec < 0) return(false);

		if (!await this.fire(EventType.PreUpdate))
		{
			return(false);
		}

		let outcome:boolean = await this.fire(EventType.PostUpdate);

		return(outcome);
	}

	public async fetch() : Promise<Record[]>
	{
		let cursor:Record[] = this.cursor;
		if (cursor == null) cursor = this.records;
		return([cursor[this.pos$++]]);
	}

	public async query() : Promise<boolean>
	{
		if (!this.queryable)
			return(false);

		this.cursor = this.records;

		return(true);
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