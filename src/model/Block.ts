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

	private form:Form = null;
	private name$:string = null;
	private record$:number = -1;
	private vwblk:ViewBlock = null;
	private source$:DataSource = null;
	private intfrm:InterfaceForm = null;
	private intblk:InterfaceBlock = null;

	private constructor(form:Form, name:string)
	{
		this.form = form;
		this.name$ = name;
		this.form.addBlock(this);
		this.intfrm = form.parent;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get datasource() : DataSource
	{
		let recs:number = this.vwblk.rows;

		if (this.source$ == null)
		{
			let records:Record[] = [];

			for (let i = 0; i < recs; i++)
				records.push(new Record());

			this.source$ = new MemoryTable(this.intblk,records);

			this.source$.queryable = false;
			this.source$.deleteable = false;
			this.source$.insertable = false;
		}

		return(this.source$);
	}

	public set datasource(source:DataSource)
	{
		this.source$ = source;
	}

	public validated() : boolean
	{
		return(this.vwblk.validated);
	}

	public async preField(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.PreField,event));
	}

	public async postField(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.PostField,event));
	}

	public async onEditing(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.Editing,event));
	}

	public async validateField(event:Event) : Promise<boolean>
	{
		return(this.fire(EventType.ValidateField,event));
	}

	public async onKey(event:Event, field:string, key:KeyMap) : Promise<boolean>
	{
		return(this.fire(EventType.Editing,event,field,key));
	}

	public async validateRecord() : Promise<boolean>
	{
		let cont:boolean = await this.fire(EventType.ValidateRecord,null);
		return(cont);
	}

	public async setCurrentRecord(delta:number) : Promise<boolean>
	{
		if (this.record$ < 0)
		{
			this.record$ = delta;
			return(await this.fire(EventType.PreRecord,null));
		}

		let cont:boolean = false;
		let next:number = this.record$ + delta;

		if (next >= 0 && next <= 2) cont = true;

		if (cont)
		{
			await this.fire(EventType.PostRecord,null);
			this.record$ += delta;
			await this.fire(EventType.PreRecord,null);
		}

		return(cont);
	}

	public get record() : number
	{
		return(this.record$);
	}

	public get interface() : InterfaceBlock
	{
		return(this.intblk);
	}

	public link(block:InterfaceBlock) : void
	{
		this.intblk = block;
	}

	public linkView() : void
	{
		this.vwblk = ViewForm.getForm(this.form.parent).getBlock(this.name);
	}

	public unlinkView() : void
	{
		this.vwblk = null;
	}

	public isLinked() : boolean
	{
		return(this.intblk != null);
	}

	private async fire(type:EventType, event:Event, field?:string, key?:KeyMap) : Promise<boolean>
	{
		let frmevent:FormEvent = null;
		if (key != null) frmevent = FormEvent.newKeyEvent(this.intfrm,key,event,this.name,field);
		else 			 frmevent = FormEvent.newFieldEvent(type,this.intfrm,event,this.name,field);
		return(FormEvents.raise(frmevent));
	}
}