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

export class InMemory implements DataSource
{
	private bef$:Record = null;
	private aft$:Record = null;
	private block$:Block = null;
	private cursor:Record[] = [];
	private records:Record[] = [];
	private filters:Filter[] = [];

	constructor(block:Block, records?:Record[])
	{
		if (records == null)
			records = [];

		this.block$ = block;
		this.cursor = records;
		this.records = records;
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

	public after() : Record
	{
		return(this.aft$);
	}

	public before() : Record
	{
		return(this.bef$);
	}

	public async delete(oid:number) : Promise<boolean>
	{
		let cur:number = this.indexOf(this.cursor,oid);
		let rec:number = this.indexOf(this.records,oid);

		if (rec < 0) return(false);

		this.aft$ = null;
		this.bef$ = this.records[rec];

		if (!await this.fire(EventType.PreDelete))
		{
			this.bef$ = null;
			return(false);
		}

		delete this.records[rec];
		if (cur >= 0) delete this.cursor[cur];

		let outcome:boolean = await this.fire(EventType.PostDelete);

		this.bef$ = null;
		return(outcome);
	}

	public async insert(oid?:any, before?:boolean) : Promise<Record>
	{
		this.bef$ = null;
		this.aft$ = {oid: new Object(), columns: {}};

		let cur:number = 0;
		let rec:number = 0;

		if (oid != null)
		{
			cur = this.indexOf(this.cursor,oid);
			rec = this.indexOf(this.records,oid);
		}

		if (cur < 0) cur = 0;
		if (rec < 0) rec = 0;

		if (before)
		{
			if (cur > 0) cur--;
			if (rec > 0) rec--;
		}

		if (!await this.fire(EventType.PreInsert))
		{
			this.aft$ = null;
			return(null);
		}

		if (!await this.fire(EventType.PostInsert))
		{
			this.aft$ = null;
			return(null);
		}

		let ins:Record = this.aft$;
		this.cursor.splice(cur,0,ins);
		this.records.splice(rec,0,ins);

		this.aft$ = null;
		return(ins);
	}

	public async update(record:Record) : Promise<boolean>
	{
		let cur:number = this.indexOf(this.cursor,record.oid);
		let rec:number = this.indexOf(this.records,record.oid);

		if (rec < 0) return(false);

		this.aft$ = record;
		this.bef$ = this.records[rec];

		if (!await this.fire(EventType.PreUpdate))
		{
			this.bef$ = null;
			this.aft$ = null;
			return(false);
		}

		this.records[rec] = this.aft$;
		if (cur >= 0) this.cursor[cur] = this.aft$;

		let outcome:boolean = await this.fire(EventType.PostUpdate);

		this.bef$ = null;
		this.aft$ = null;

		return(outcome);
	}

	public async fetch(oid?:any, records?:number, forward?:boolean) : Promise<Record[]>
	{
		let start:number = 0;
		let recs:Record[] = [];

		if (records == null)
			records = 1;

		if (forward == null)
			forward = true;

		if (oid != null)
			start = this.indexOf(this.cursor,oid);

		if (!forward)
		{
			start = start - records;

			if (start < 0)
			{
				records -= start;
				start = 0;
			}
		}

		for (let i = start; i < start + records && i < this.cursor.length; i++)
			recs.push(this.cursor[i])

		return(recs);
	}

	public async query() : Promise<boolean>
	{
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
			if (records[i].oid == oid)
				return(i);
		}

		return(-1);
	}
}