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

import { Record } from "./Record.js";
import { Form } from "../public/Form.js";
import { Block as ModelBlock } from "../model/Block.js";
import { DataSource } from "./interfaces/DataSource.js";
import { EventType } from "../control/events/EventType.js";
import { FormEvent, FormEvents } from "../control/events/FormEvents.js";

export class DataModel
{
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
}

export class DataSourceWrapper
{
	private eof$:boolean;
	private cache$:Record[];
	private form:Form = null;
	private winpos$:number[] = [0,-1];

	constructor(private block:ModelBlock)
	{
		this.cache$ = [];
		this.eof$ = false;
		this.form = block.form.parent;
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
		return(this.block.columns);
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

	public create(record?:Record, before?:boolean) : Record
	{
		if (!this.source.insertable) return(null);

		let pos:number = this.indexOf(record);
		if (before && pos > 0) pos--;

		let inserted:Record = new Record(this);
		this.cache$.splice(pos,0,record);

		if (this.winpos$[1] - this.winpos$[0] + 1 >= this.window)
			this.winpos$[1]--;

		return(inserted);
	}

	public async insert(record:Record) : Promise<boolean>
	{
		if (!this.source.insertable)
			return(false);

		if (!await this.fire(EventType.PreInsert))
			return(false);

		if (!this.source.insert(record))
			return(false);

		return(!await this.fire(EventType.PostInsert));
	}

	public async update(record:Record) : Promise<boolean>
	{
		if (!this.source.updateable)
			return(false);

		if (!await this.fire(EventType.PreUpdate))
			return(false);

		if (!this.source.update(record))
			return(false);

		return(!await this.fire(EventType.PostUpdate));
	}

	public async delete(record:Record) : Promise<boolean>
	{
		if (!this.source.deleteable)
			return(false);

		if (!await this.fire(EventType.PreDelete))
			return(false);

		if (!this.source.delete(record))
			return(false);

		return(!await this.fire(EventType.PostDelete));
	}

	public getRecord(record:number) : Record
	{
		return(this.cache$[record]);
	}

	public async query() : Promise<boolean>
	{
		return(this.source.query());
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

			this.winpos$[1]++;

			if (this.winpos$[1] - this.winpos$[0] + 1 > this.window)
				this.winpos$[0]++;

			return(this.cache$[this.winpos$[1]]);
		}
	}

	private indexOf(record:Record) : number
	{
		if (record == null)
			return(0);

		for (let i = 0; i < this.cache$.length; i++)
		{
			if (this.cache$[i].id == record.id)
				return(i);
		}

		return(0);
	}

	private async fire(type:EventType) : Promise<boolean>
	{
		return(FormEvents.raise(FormEvent.newBlockEvent(type,this.form,this.block.name)));
	}
}