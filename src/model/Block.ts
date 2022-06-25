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
import { Alert } from "../application/Alert.js";
import { DataSourceWrapper } from "./DataModel.js";
import { Form as ViewForm } from "../view/Form.js";
import { Block as ViewBlock } from '../view/Block.js';
import { DataSource } from "./interfaces/DataSource.js";
import { EventTransaction } from "./EventTransaction.js";
import { Form as InterfaceForm } from '../public/Form.js';
import { MemoryTable } from "./datasources/MemoryTable.js";
import { EventType } from "../control/events/EventType.js";
import { Block as InterfaceBlock } from '../public/Block.js';
import { FormEvents, FormEvent } from "../control/events/FormEvents.js";


export class Block
{
	public static create(form:Form|ViewForm, block:InterfaceBlock|ViewBlock) : Block
	{
		if (form instanceof ViewForm)
			form = Form.getForm(form.parent);

		let blk:Block = form.getBlock(block.name);

		if (blk == null)
			blk = new Block(form,block.name);

		if (block instanceof InterfaceBlock)
			blk.link(block);

		return(blk);
	}

	public static getBlock(block:InterfaceBlock) : Block
	{
		return(Form.getForm(block.form).getBlock(block.name));
	}

	private form$:Form = null;
	private keys$:Key[] = [];
	private name$:string = null;
	private record$:number = -1;
	private vwblk:ViewBlock = null;
	private columns$:string[] = null;
	private source$:DataSource = null;
	private intfrm:InterfaceForm = null;
	private intblk:InterfaceBlock = null;

	private constructor(form:Form, name:string)
	{
		this.form$ = form;
		this.name$ = name;
		this.form$.addBlock(this);
		this.intfrm = form.parent;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get view() : ViewBlock
	{
		return(this.vwblk);
	}

	public get columns() : string[]
	{
		if (this.columns$ == null)
			this.columns$ = this.vwblk.getFieldNames();

		return(this.columns$);
	}

	public get eventTransaction() : EventTransaction
	{
		return(this.form.eventTransaction);
	}

	public setEventTransaction(event:EventType, offset:number) : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx != null)
		{
			Alert.fatal("Cannot start transaction: "+EventType[event]+". Form in transaction "+evttrx.event,"Transaction Failure");
			return;
		}

		evttrx = new EventTransaction(event,this,null,offset,true);
		this.form.eventTransaction = evttrx;
	}

	public endEventTransaction(apply:boolean) : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx == null || evttrx.blocked)
		{
			Alert.fatal("Block not in transaction","Transaction Failure");
			return;
		}

		if (apply)
			evttrx.apply();

		this.form.eventTransaction = null;
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
		}

		this.source$ = source;
	}

	public createMemorySource(recs?:number, columns?:string[]) : MemoryTable
	{
		let data:any[][] = [];

		if (recs == null)
		{
			recs = this.vwblk.rows;
			columns = this.columns;
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
		return(this.form.datamodel.getWrapper(this));
	}

	public get keys() : Key[]
	{
		return(this.keys$);
	}

	public addKey(name:string, fields:string|string[], primary?:boolean) : void
	{
		if (primary)
		{
			for (let i = 0; i < this.keys$.length; i++)
				this.keys$[i].primary = false;
		}

		this.keys$.push(new Key(name,this,fields,primary));
	}

	public removeKey(name:string) : boolean
	{
		for (let i = 0; i < this.keys$.length; i++)
		{
			if (name == this.keys$[i].name)
			{
				if (this.keys$[i].primary)
					throw "@Block: Cannot delete primary key";

				delete this.keys$[i];
				return(true);
			}
		}

		return(false);
	}

	public async preQuery() : Promise<boolean>
	{
		let record:Record = new Record(null);
		this.setModelEventTransaction(EventType.PreQuery,record);
		let success:boolean = await this.fire(EventType.PreQuery);
		this.endModelEventTransaction(success);
		return(success);
	}

	public async postQuery(record:Record) : Promise<boolean>
	{
		this.setModelEventTransaction(EventType.PostQuery,record);
		let success:boolean = await this.fire(EventType.PostQuery);
		this.endModelEventTransaction(success);
		return(success);
	}

	public async validateRecord() : Promise<boolean>
	{
		this.setEventTransaction(EventType.ValidateRecord,0);
		let success:boolean = await this.fire(EventType.ValidateRecord);
		this.endEventTransaction(success);
		return(success);
	}

	public move(delta:number) : void
	{
		this.record$ = this.record + delta;
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
		if (this.columns.indexOf(field) < 0)
			this.columns.push(field);

		return(this.wrapper.setValue(this.record,field,value));
	}

	public async executequery() : Promise<boolean>
	{
		if (!await this.preQuery())
			return(false);

		if (!this.view.clear()) return(false);
		let wrapper:DataSourceWrapper = this.wrapper;

		this.record$ = -1;

		if (!await wrapper.query()) return(false);
		let record:Record = await wrapper.fetch();

		for (let i = 0; i < this.vwblk.rows && record != null; i++)
		{
			this.vwblk.display(i,record);

			if (i == 0)
				this.vwblk.setCurrentRow(0)

			record = await wrapper.fetch();
		}

		return(true);
	}

	public async queryDetails() : Promise<boolean>
	{
		console.log("queryDetails");
		return(true);
	}

	public getRecord(offset?:number) : Record
	{
		if (offset == null) offset = 0;
		return(this.wrapper.getRecord(this.record+offset));
	}

	public link(block:InterfaceBlock) : void
	{
		this.intblk = block;
	}

	public linkView() : void
	{
		this.vwblk = ViewForm.getForm(this.form$.parent).getBlock(this.name);
	}

	public unlinkView() : void
	{
		this.vwblk = null;
	}

	public isLinked() : boolean
	{
		return(this.intblk != null);
	}

	private setModelEventTransaction(event:EventType, record:Record) : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx != null && !evttrx.blocked)
		{
			Alert.fatal("Already in transaction","Transaction Failure");
			return;
		}

		if (evttrx) evttrx.join(this,record,0,false);
		else evttrx = new EventTransaction(event,this,record,0,false,true);

		this.form.eventTransaction = evttrx;
	}

	private endModelEventTransaction(apply:boolean) : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx == null || !evttrx.blocked)
		{
			Alert.fatal("Model not in transaction","Transaction Failure");
			return;
		}

		if (apply) evttrx.apply(this);
		else 	   evttrx.remove(this);

		if (evttrx.done())
			this.form.eventTransaction = null;
	}

	private async fire(type:EventType) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.BlockEvent(type,this.intfrm,this.name);
		return(FormEvents.raise(frmevent));
	}
}