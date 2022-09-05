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

import { Filter } from "./interfaces/Filter.js";
import { Record, RecordStatus } from "./Record.js";
import { Block as ModelBlock } from "../model/Block.js";
import { DataSource } from "./interfaces/DataSource.js";

export class DataSourceWrapper
{
	private eof$:boolean;
	private cache$:Record[];
	private hwm$:number = 0;
	private filters$:Filter[] = [];
	private columns$:string[] = [];
	private source$:DataSource = null;

	constructor(public block?:ModelBlock)
	{
		this.cache$ = [];
		this.eof$ = false;
	}

	public get source() : DataSource
	{
		if (this.source$ == null)
			this.source$ = this.block?.datasource;

		return(this.source$);
	}

	public set source(source:DataSource)
	{
		this.source$ = source;
	}

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public set columns(columns:string[])
	{
		this.columns$ = columns;
	}

	public get filters() : Filter[]
	{
		return(this.filters$);
	}

	public clear() : void
	{
		this.hwm$ = 0;
		this.cache$ = [];
		this.columns$ = [];

		this.source.post();

		this.filters$ = [];
		this.source.closeCursor();
	}

	public getValue(record:number, field:string) : any
	{
		return(this.cache$[record]?.getValue(field));
	}

	public setValue(record:number, field:string, value:any) : boolean
	{
		if (record < 0 || record >= this.cache$.length)
			return(false);

		this.cache$[record].setValue(field,value);
		return(true);
	}

	public locked(record:Record) : boolean
	{
		if (record.status == RecordStatus.New || record.status == RecordStatus.Inserted)
			return(true);

		return(record.locked);
	}

	public async lock(record:Record) : Promise<boolean>
	{
		if (record.status == RecordStatus.New || record.status == RecordStatus.Inserted)
			return(true);

		let success:boolean = await this.source.lock(record);
		if (success) record.locked = true;

		return(success);
	}

	public async push(record?:Record) : Promise<boolean>
	{
		switch(record.status)
		{
			case RecordStatus.New :

				if (await this.source.insert(record))
					record.status = RecordStatus.Inserted;
				break;

			case RecordStatus.Deleted : return(await this.source.delete(record));
			case RecordStatus.Updated : return(await this.source.update(record));
			case RecordStatus.Inserted : return(await this.source.update(record));
		}

		return(true);
	}

	public create(pos:number, before?:boolean) : Record
	{
		this.hwm$++;

		if (pos > this.cache$.length)
			pos = this.cache$.length - 1;

		if (before && pos >= 0) pos--;
		let inserted:Record = new Record(this.source);
		this.cache$.splice(pos+1,0,inserted);

		inserted.wrapper = this;
		inserted.prepared = true;

		return(inserted);
	}

	public async insert(record:Record) : Promise<boolean>
	{
		if (!await this.block.preInsert(record))
			return(false);

		if (!this.source.insert(record))
			return(false);

		return(!await this.block.postInsert());
	}

	public async update(record:Record) : Promise<boolean>
	{
		if (!await this.block.preUpdate())
			return(false);

		if (!this.source.update(record))
			return(false);

		return(!await this.block.postUpdate());
	}

	public async delete(record:Record) : Promise<boolean>
	{
		let pos:number = this.index(record);

		if (pos < 0)
			return(false);

		if (!await this.block.preDelete())
			return(false);

		if (!this.source.delete(record))
			return(false);

		this.hwm$--;
		this.cache$.splice(pos,1);

		return(await this.block.postDelete());
	}

	public getRecord(record:number) : Record
	{
		return(this.cache$[record]);
	}

	public async query(filters?:Filter|Filter[]) : Promise<boolean>
	{
		this.filters$ = [];

		if (filters != null)
		{
			if (Array.isArray(filters)) this.filters$ = filters;
			else						this.filters$ = [filters];
		}

		let success:boolean = await this.source.query(filters);

		if (success)
		{
			this.hwm$ = 0;
			this.cache$ = [];
			this.eof$ = false;
		}

		return(success);
	}

	public async fetch() : Promise<Record>
	{
		if (this.hwm$ >= this.cache$.length-1)
		{
			if (this.eof$) return(null);
			let recs:Record[] = await this.source.fetch();

			if (recs == null || recs.length == 0)
			{
				this.eof$ = true;
				return(null);
			}

			if (recs.length < this.source.arrayfecth)
				this.eof$ = true;

			this.cache$.push(...recs);
		}

		let record:Record = this.cache$[this.hwm$];

		if (!record.prepared)
		{
			record.wrapper = this;

			if (!await this.block.onFetch(record))
				return(null);

			record.prepared = true;
		}

		this.hwm$++;
		return(record);
	}

	public async prefetch(record:number,records:number) : Promise<number>
	{
		let possible:number = 0;

		if (records < 0)
		{
			possible = record > -records ? -records : record;
		}
		else
		{
			possible = this.cache$.length - record - 1;
			if (possible > records) possible = records;

			while(possible < records)
			{
				if (await this.fetch() == null)
					break;

				possible++;
			}
		}

		if (possible < 0) possible = 0;
		return(possible);
	}

	public indexOf(column:string) : number
	{
		let idx:number = this.columns$.indexOf(column);

		if (idx < 0)
		{
			this.columns$.push(column);
			idx = this.columns$.length-1;
		}

		return(idx);
	}

	public async copy(header?:boolean, all?:boolean) : Promise<string[][]>
	{
		let table:string[][] = [];
		let head:string[] = this.columns;
		while(all && await this.fetch() != null);

		if (header)
			table.push(head);

		this.cache$.forEach((record) =>
		{
			if (record.prepared)
			{
				let data:string[] = [];
				head.forEach((col) => {data.push(record.getValue(col))})
				table.push(data);
			}
		})

		return(table);
	}

	private index(record:Record) : number
	{
		if (record == null)
			return(-1);

		for (let i = 0; i < this.cache$.length; i++)
		{
			if (this.cache$[i].id == record.id)
				return(i);
		}

		return(-1);
	}
}