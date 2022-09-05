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

import { Form } from "./Form.js";
import { Record } from "./Record.js";
import { Key } from "./relations/Key.js";
import { Filter } from "./interfaces/Filter.js";
import { QueryByExample } from "./QueryByExample.js";
import { Block as ViewBlock } from '../view/Block.js';
import { DataSource } from "./interfaces/DataSource.js";
import { Form as InterfaceForm } from '../public/Form.js';
import { MemoryTable } from "./datasources/MemoryTable.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";
import { EventType } from "../control/events/EventType.js";
import { FormBacking } from "../application/FormBacking.js";
import { Block as InterfaceBlock } from '../public/Block.js';
import { FormEvents, FormEvent } from "../control/events/FormEvents.js";


export class Block
{
	private form$:Form = null;
	private keys$:Key[] = [];
	private name$:string = null;
	private record$:number = -1;
	private view$:ViewBlock = null;
	private ctrlblk$:boolean = false;
	private source$:DataSource = null;
	private intfrm:InterfaceForm = null;
	private intblk:InterfaceBlock = null;
	private qbe:QueryByExample = new QueryByExample();

	constructor(form:Form, name:string)
	{
		this.name$ = name;
		this.form$ = form;
		this.form.addBlock(this);
		this.intfrm = form.parent;
		this.datasource = form.datamodel.getDataSource(this.name);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get empty() : boolean
	{
		return(this.record$ < 0);
	}

	public get view() : ViewBlock
	{
		return(this.view$);
	}

	public get ctrlblk() : boolean
	{
		return(this.ctrlblk$);
	}

	public get qberec() : Record
	{
		return(this.qbe.record);
	}

	public get querymode() : boolean
	{
		return(this.qbe.querymode);
	}

	public set ctrlblk(flag:boolean)
	{
		this.ctrlblk$ = flag;
	}

	public get qbeallowed() : boolean
	{
		return(this.intblk.qbeallowed);
	}

	public get queryallowed() : boolean
	{
		return(this.intblk.queryallowed);
	}

	public get insertallowed() : boolean
	{
		return(this.intblk.insertallowed);
	}

	public get updateallowed() : boolean
	{
		return(this.intblk.updateallowed);
	}

	public get deleteallowed() : boolean
	{
		return(this.intblk.deleteallowed);
	}

	public hasEventTransaction() : boolean
	{
		return(this.form.hasEventTransaction(this));
	}

	public checkEventTransaction(event:EventType) : boolean
	{
		return(this.form.checkEventTransaction(event,this));
	}

	public async wait4EventTransaction(event:EventType, ) : Promise<boolean>
	{
		return(this.form.wait4EventTransaction(event,this));
	}

	public async setEventTransaction(event:EventType, record:Record) : Promise<boolean>
	{
		this.form.setEventTransaction(event,this,record);
		return(true);
	}

	public endEventTransaction(event:EventType, success:boolean) : void
	{
		this.form.endEventTransaction(event,this,success);
	}

	public get datasource() : DataSource
	{
		return(this.source$);
	}

	public set datasource(source:DataSource)
	{
		if (this.source$ != null)
		{
			this.form$.datamodel.clear(this);
			this.form$.datamodel.setWrapper(this);

			this.view.reset(true,true);
			this.view.lockUnused();
		}

		this.ctrlblk = false;
		this.source$ = source;
	}

	public get filters() : Filter[]
	{
		return(this.wrapper.filters);
	}

	public createMemorySource(recs?:number, columns?:string[]) : MemoryTable
	{
		let data:any[][] = [];

		if (recs == null)
		{
			recs = this.view$.rows;
			columns = this.view$.getFieldNames();
		}

		for (let r = 0; r < recs; r++)
		{
			let row:any[] = [];

			for (let c = 0; c < columns.length; c++)
				row.push(null);

			data.push(row);
		}

		return(new MemoryTable(columns,data));
	}

	private get wrapper() : DataSourceWrapper
	{
		if (this.querymode) return(this.qbe.wrapper);
		return(this.form.datamodel.getWrapper(this));
	}

	public get keys() : Key[]
	{
		return(this.keys$);
	}

	public addKey(name:string, fields:string|string[]) : void
	{
		this.keys$.push(new Key(name,this,fields));
	}

	public removeKey(name:string) : boolean
	{
		for (let i = 0; i < this.keys$.length; i++)
		{
			if (name == this.keys$[i].name)
			{
				this.keys$.splice(i,1);
				return(true);
			}
		}

		return(false);
	}

	public async preInsert(record:Record) : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.setEventTransaction(EventType.PreInsert,record)) return(false);
		let success:boolean = await this.fire(EventType.PreInsert);
		this.endEventTransaction(EventType.PreInsert,success);
		return(success);
	}

	public async postInsert() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.wait4EventTransaction(EventType.PostInsert)) return(false);
		let success:boolean = await this.fire(EventType.PostInsert);
		this.endEventTransaction(EventType.PostInsert,success);
		return(success);
	}

	public async preUpdate() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		let record:Record = this.getRecord();
		if (!await this.setEventTransaction(EventType.PreUpdate,record)) return(false);
		let success:boolean = await this.fire(EventType.PreUpdate);
		this.endEventTransaction(EventType.PreUpdate,success);
		return(success);
	}

	public async postUpdate() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.wait4EventTransaction(EventType.PostUpdate)) return(false);
		let success:boolean = await this.fire(EventType.PostUpdate);
		return(success);
	}

	public async preDelete() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		let record:Record = this.getRecord();
		if (!await this.setEventTransaction(EventType.PreDelete,record)) return(false);
		let success:boolean = await this.fire(EventType.PreDelete);
		this.endEventTransaction(EventType.PreDelete,success);
		return(success);
	}

	public async postDelete() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.wait4EventTransaction(EventType.PostDelete)) return(false);
		let success:boolean = await this.fire(EventType.PostDelete);
		return(success);
	}

	public async preQuery() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.setEventTransaction(EventType.PreQuery,this.qberec)) return(false);
		let success:boolean = await this.fire(EventType.PreQuery);
		this.endEventTransaction(EventType.PreQuery,success);
		return(success);
	}

	public async onFetch(record:Record) : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.setEventTransaction(EventType.OnFetch,record)) return(false);
		let success:boolean = await this.fire(EventType.OnFetch);
		this.endEventTransaction(EventType.OnFetch,success);
		return(success);
	}

	public async postQuery() : Promise<boolean>
	{
		if (this.ctrlblk) return(true);
		if (!await this.wait4EventTransaction(EventType.PostQuery)) return(false);
		let success:boolean = await this.fire(EventType.PostQuery);
		return(success);
	}

	public async validateRecord() : Promise<boolean>
	{
		let record:Record = this.getRecord();
		if (!await this.setEventTransaction(EventType.WhenValidateRecord,record)) return(false);
		let success:boolean = await this.fire(EventType.WhenValidateRecord);
		this.endEventTransaction(EventType.WhenValidateRecord,success);
		if (success) success = await this.wrapper.push(record);
		return(success);
	}

	public move(delta:number) : number
	{
		this.record$ = this.record + delta;
		return(this.record$);
	}

	public get record() : number
	{
		if (this.record$ < 0) return(0);
		else				  return(this.record$);
	}

	public get interface() : InterfaceBlock
	{
		return(this.intblk);
	}

	public getValue(field:string) : any
	{
		return(this.wrapper.getValue(this.record,field));
	}

	public setValue(field:string, value:any) : boolean
	{
		return(this.wrapper.setValue(this.record,field,value));
	}

	public locked(record?:Record) : boolean
	{
		if (this.querymode) return(true);
		if (record == null)	record = this.getRecord(0);
		return(this.wrapper.locked(record));
	}

	public async lock(record?:Record) : Promise<boolean>
	{
		if (this.querymode) return(true);
		if (record == null)	record = this.getRecord(0);
		return(this.wrapper.lock(record));
	}

	public async insert(before?:boolean) : Promise<boolean>
	{
		if (before == null)
			before = false;

		if (this.querymode)
			return(false);

		if (!await this.view.validateRow())
			return(false);

		if (!this.checkEventTransaction(EventType.PreInsert))
			return(false);

		if (!this.view.getCurrentRow().exist)
		{
			before = true;
			this.view.openrow();
		}

		let record:Record = this.wrapper.create(this.record,before);

		if (record != null)
		{
			let success:boolean = true;
			this.scroll(0,this.view.row);

			if (before)	this.view.refresh(record);
			else success = await this.view.nextrecord();

			if (success) this.view.findFirstEditable(record)?.focus();
		}

		return(record != null);
	}

	public async delete() : Promise<boolean>
	{
		if (this.querymode)
			return(false);

		if (!this.checkEventTransaction(EventType.PreDelete))
			return(false);

		let offset:number = this.view.rows - this.view.row;
		let success:boolean = await this.wrapper.delete(this.getRecord());

		if (success)
		{
			this.move(-1);
			await this.prefetch(0,offset);

			this.scroll(0,this.view.row);

			if (!this.view.getCurrentRow().exist)
			{
				this.move(1);
				this.view.prevrecord();
				return(true);
			}

			this.view.refresh(this.getRecord());
			this.view.findFirstEditable(this.getRecord())?.focus();
		}

		return(true);
	}

	public async enterQuery() : Promise<boolean>
	{
		if (!this.view.validated)
		{
			if (!await this.view.validateBlock())
				return(false);
		}

		this.wrapper.clear();
		this.qbe.querymode = true;
		this.view.reset(true,true);
		this.view.display(0,this.qberec);

		this.view.lockUnused();
		this.view.setCurrentRow(0);

		return(true);
	}

	public async executeQuery(filters?:Filter|Filter[]) : Promise<boolean>
	{
		if (!this.view.validated)
		{
			if (!await this.view.validateBlock())
				return(false);
		}

		if (!await this.preQuery())
			return(false);

		this.view.reset(true,true);
		this.qbe.querymode = false;
		let wrapper:DataSourceWrapper = this.wrapper;

		this.record$ = -1;
		let record:Record = null;

		if (!await wrapper.query(filters))
			return(false);

		for (let i = 0; i < this.view.rows; i++)
		{
			record = await wrapper.fetch();

			if (record == null)
				break;

			this.record$ = 0;
			this.view.display(i,record);
			if (i == 0)	this.view$.setCurrentRow(0);
		}

		this.view.lockUnused();

		if (!await this.postQuery())
			return(false);

		return(true);
	}

	public scroll(records:number, offset:number) : boolean
	{
		if (this.querymode)
			return(false);

		let displayed:number = 0;
		this.view.reset(false,false);

		let wrapper:DataSourceWrapper = this.wrapper;
		let pos:number = this.record + records - offset;

		if (pos < 0)
		{
			pos = 0;
			records = offset - this.record;
		}

		for (let i = 0; i < this.view.rows; i++)
		{
			let rec:Record = wrapper.getRecord(pos++);

			if (rec == null)
				break;

			displayed++;
			this.view$.display(i,rec);
		}

		if (offset >= displayed)
			records = records - offset + displayed - 1;

		this.move(records);

		this.view.lockUnused();
		return(true);
	}

	public async queryDetails() : Promise<boolean>
	{
		if (this.querymode)
			return(true);

		return(true);
	}

	public async prefetch(records:number, offset:number) : Promise<number>
	{
		return(this.wrapper.prefetch(this.record+offset,records));
	}

	public getRecord(offset?:number) : Record
	{
		if (offset == null) offset = 0;
		if (this.querymode) return(this.qberec);
		return(this.wrapper.getRecord(this.record+offset));
	}

	public async copy(header?:boolean, all?:boolean) : Promise<string[][]>
	{
		return(this.wrapper?.copy(all,header));
	}

	public finalize() : void
	{
		this.intblk = this.form.parent.getBlock(this.name);
		this.view$ = FormBacking.getViewForm(this.form$.parent).getBlock(this.name);
		if (this.intblk == null) this.intblk = new InterfaceBlock(this.intfrm,this.name);
	}

	private async fire(type:EventType) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.BlockEvent(type,this.intfrm,this.name);
		return(FormEvents.raise(frmevent));
	}
}