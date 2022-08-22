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

import { Record, RecordStatus } from "./Record.js";
import { Filter } from "./interfaces/Filter.js";
import { Block as ModelBlock } from "../model/Block.js";
import { DataSource } from "./interfaces/DataSource.js";

export class DataModel
{
	private defined$:Map<string,DataSource> =
		new Map<string,DataSource>();

	private sources$:Map<ModelBlock,DataSourceWrapper> =
		new Map<ModelBlock,DataSourceWrapper>();

	public clear(block:ModelBlock) : void
	{
		this.getWrapper(block)?.clear();
	}

	public getWrapper(block:ModelBlock) : DataSourceWrapper
	{
		return(this.sources$.get(block));
	}

	public setWrapper(block:ModelBlock) : DataSourceWrapper
	{
		let wrapper:DataSourceWrapper = new DataSourceWrapper(block);
		this.sources$.set(block,wrapper);
		return(wrapper);
	}

	public getDataSource(block:string) : DataSource
	{
		let src:DataSource = this.defined$.get(block);
		if (src != null) this.defined$.delete(block);
		return(src);
	}

	public setDataSource(block:string, source:DataSource) : void
	{
		this.defined$.set(block,source);
	}
}

export class DataSourceWrapper
{
	private eof$:boolean;
	private cache$:Record[];
	private winpos$:number[] = [0,-1];

	constructor(public block:ModelBlock)
	{
		this.cache$ = [];
		this.eof$ = false;
	}

	public get window() : number
	{
		return(this.block.view.rows);
	}

	public get source() : DataSource
	{
		return(this.block.datasource);
	}

	public get columns() : string[]
	{
		return(this.source.columns);
	}

	public clear() : void
	{
		this.source.post();
		this.winpos$ = [0,-1];
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

	public async post(record?:Record) : Promise<boolean>
	{
		console.log("post "+record.getValue("first_name")+" "+RecordStatus[record.status]);

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

	public async create(current:Record, before?:boolean) : Promise<Record>
	{
		let pos:number = this.indexOf(current);
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
		let pos:number = this.indexOf(record);

		if (pos < 0)
			return(false);

		if (!await this.block.preDelete())
			return(false);

		if (!this.source.delete(record))
			return(false);

		this.cache$.splice(pos,1);

		console.log("1 *******")
		this.cache$.forEach((rec) => {console.log(rec.getValue("first_name"))})
		console.log("2 *******")

		return(await this.block.postDelete());
	}

	public getRecord(record:number) : Record
	{
		return(this.cache$[record]);
	}

	public async query(filters?:Filter|Filter[]) : Promise<boolean>
	{
		let success:boolean = await this.source.query(filters);

		if (success)
		{
			this.cache$ = [];
			this.eof$ = false;
			this.winpos$ = [0,-1];
		}

		return(success);
	}

	public async fetch(previous?:boolean) : Promise<Record>
	{
		if (previous)
		{
			if (this.winpos$[0] < 1)
				return(null);

			this.winpos$[0]--;

			if (this.winpos$[1] - this.winpos$[0] + 1 > this.window)
				this.winpos$[1]--;

			return(this.cache$[this.winpos$[0]]);
		}
		else
		{
			console.log("this.winpos$[1]: "+this.winpos$[1]+" this.cache$.length: "+this.cache$.length);

			if (this.winpos$[1] >= this.cache$.length-1)
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

			let undo:number[] = this.winpos$;

			this.winpos$[1]++;

			if (this.winpos$[1] - this.winpos$[0] + 1 > this.window)
				this.winpos$[0]++;

			let record:Record = this.cache$[this.winpos$[1]];

			if (!record.prepared)
			{
				record.wrapper = this;

				if (!await this.block.onFetch(record))
				{
					this.winpos$ = undo;
					return(null);
				}
				record.prepared = true;
			}

			return(record);
		}
	}

	public async prefetch(record:number,records:number) : Promise<number>
	{
		let possible:number = 0;
		console.log("prefetch("+record+","+records+")")

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

	public async copy(header?:boolean, all?:boolean) : Promise<string[][]>
	{
		let table:string[][] = [];

		if (all) while(await this.fetch() != null);

		let head:string[] = [];

		if (this.source != null)
		{
			head = this.source.columns;
		}
		else
		{
			if (this.cache$.length > 0)
				this.cache$[0].columns.forEach((col) => head.push(col));
		}

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

	private indexOf(record:Record) : number
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