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
import { DataSourceWrapper } from "./DataModel.js";
import { Form as ViewForm } from "../view/Form.js";
import { KeyMap } from "../control/events/KeyMap.js";
import { Block as ViewBlock } from '../view/Block.js';
import { DataSource } from "./interfaces/DataSource.js";
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
	private postquery$:Record = null;
	private source$:DataSource = null;
	private intfrm:InterfaceForm = null;
	private intblk:InterfaceBlock = null;
	private disconnected$:boolean = false;

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

	public get postquery() : boolean
	{
		return(this.postquery$ != null);
	}

	public get disconnected() : boolean
	{
		return(this.disconnected$);
	}

	public set disconnected(flag:boolean)
	{
		this.disconnected$ = flag;
	}

	public get datasource() : DataSource
	{
		if (this.source$ == null)
		{
			let data:any[][] = [];
			let recs:number = this.vwblk.rows;
			let cols:number = this.columns.length;

			for (let r = 0; r < recs; r++)
			{
				let row:any[] = [];

				for (let c = 0; c < cols; c++)
					row.push(null);

				data.push(row);
			}

			this.source$ = new MemoryTable(this.columns,data);

			this.source$.deleteable = false;
			this.source$.insertable = false;
		}

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

	private get wrapper() : DataSourceWrapper
	{
		return(this.form.datamodel.getWrapper(this));
	}

	public get keys() : Key[]
	{
		return(this.keys$);
	}

	public get validated() : boolean
	{
		return(this.vwblk.validated);
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

	public async preField(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.PreField,event));
	}

	public async postField(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.PostField,event));
	}

	public async preQuery() : Promise<boolean>
	{
		return(this.fire(EventType.PreQuery,null));
	}

	public async postQuery(record:Record) : Promise<boolean>
	{
		this.postquery$ = record;
		let resp:boolean = await this.fire(EventType.PostQuery,null);
		this.postquery$ = null;
		return(resp);
	}

	public async onEditing(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.Editing,event));
	}

	public async validateField(event:Event, field:string, value:any) : Promise<boolean>
	{
		if (!await this.fire(EventType.WhenValidateField,event))
			return(false);

		this.wrapper.setValue(this.record,field,value);
		return(true);
	}

	public async onKey(event:Event, key:KeyMap) : Promise<boolean>
	{
		return(this.fire(EventType.Editing,event,key));
	}

	public async validateRecord() : Promise<boolean>
	{
		return(this.fire(EventType.WhenValidateRecord,null))
	}

	public async setCurrentRecord(delta:number) : Promise<boolean>
	{
		if (this.record$ < 0)
		{
			this.record$ = delta;
			return(this.fire(EventType.PreRecord,null));
		}

		if (!await this.fire(EventType.PostRecord,null))
			return(false);

		this.record$ += delta;
		return(this.fire(EventType.PreRecord,null));
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
		if (this.disconnected$) return(null);

		if (this.postquery$ != null)
			return(this.postquery$.getValue(field));

		return(this.wrapper.getValue(this.record,field));
	}

	public setValue(field:string, value:any) : boolean
	{
		if (this.disconnected$) return(true);

		if (this.columns.indexOf(field) < 0)
			this.columns.push(field);

		if (this.postquery$ != null)
		{
			this.postquery$.setValue(field,value)
			return(true);
		}

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
				this.vwblk.displaycurrent(0);

			record = await wrapper.fetch();
		}

		return(true);
	}

	public getRecord(offset:number) : Record
	{
		return(this.wrapper.getRecord(this.record + offset));
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

	private async fire(type:EventType, event:Event, key?:KeyMap) : Promise<boolean>
	{
		let frmevent:FormEvent = null;
		if (key != null) frmevent = FormEvent.newKeyEvent(this.intfrm,key,this.name,event);
		else 			 frmevent = FormEvent.newFieldEvent(type,this.intfrm,this.name,event);
		return(FormEvents.raise(frmevent));
	}
}