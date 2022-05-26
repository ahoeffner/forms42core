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
	private cur$:Record = null;
	private mod$:Record = null;
	private block$:Block = null;
	private records:Record[] = [];
	private filters:Filter[] = [];
	private content:Record[] = [];

	constructor(block:Block, records?:Record[])
	{
		if (records == null)
			records = [];

		this.block$ = block;
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
		return(this.mod$);
	}

	public before() : Record
	{
		return(this.cur$);
	}

	public async delete(rec:number) : Promise<boolean>
	{
		this.mod$ = null;
		this.cur$ = this.records[rec];

		if (!await this.fire(EventType.PreDelete))
		{
			this.cur$ = null;
			this.mod$ = null;
			return(false);
		}

		delete this.records[rec];

		let outcome:boolean = await this.fire(EventType.PostDelete);

		this.cur$ = null;
		this.mod$ = null;

		return(outcome);
	}

	public async insert(record:Record) : Promise<boolean>
	{
		this.cur$ = null;
		this.mod$ = record;

		if (!await this.fire(EventType.PreInsert))
		{
			this.cur$ = null;
			this.mod$ = null;
			return(false);
		}

		this.cur$ = this.mod$;
		record.recno = this.records.length;
		this.records.push(this.mod$);

		let outcome:boolean = await this.fire(EventType.PostInsert);

		this.cur$ = null;
		this.mod$ = null;

		return(outcome);
	}

	public async update(record:Record) : Promise<boolean>
	{
		this.mod$ = record;
		this.cur$ = this.records[record.recno];

		if (!await this.fire(EventType.PreUpdate))
		{
			this.cur$ = null;
			this.mod$ = null;
			return(false);
		}

		this.cur$ = this.mod$;
		this.records[record.recno] = this.mod$;

		let outcome:boolean = await this.fire(EventType.PostUpdate);

		this.cur$ = null;
		this.mod$ = null;

		return(outcome);
	}

	public async fetch(start:number, records:number, forward:boolean) : Promise<Record[]>
	{
		let recs:Record[] = [];

		if (!forward)
		{
			start = start - records;

			if (start < 0)
			{
				records -= start;
				start = 0;
			}
		}

		for (let i = start; i < start + records && i < this.records.length; i++)
			recs.push(this.records[i])

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
}