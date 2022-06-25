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

import { Block } from './Block.js';
import { DataModel } from './DataModel.js';
import { Alert } from '../application/Alert.js';
import { Logger, Type } from '../application/Logger.js';
import { EventTransaction } from './EventTransaction.js';
import { Form as InterfaceForm } from '../public/Form.js';


export class Form
{
	private static models:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	public static drop(parent:InterfaceForm) : void
	{
		let remove:string[] = [];
		let form:Form = Form.models.get(parent);

		form.unlinkViews();

		form.blocks.forEach((blk) =>
		{
			if (!blk.isLinked())
				remove.push(blk.name);
		});

		remove.forEach((name) => {form.blocks.delete(name)});
	}

	public static getForm(parent:InterfaceForm) : Form
	{
		let frm:Form = Form.models.get(parent);

		if (frm == null)
			frm = new Form(parent);

		return(frm);
	}

	public static finalize(parent:InterfaceForm) : void
	{
		let form:Form = Form.models.get(parent);

		form.linkViews();
		form.autoquery();
	}

	private block$:Block = null;
	private intfrm:InterfaceForm = null;
	private evttrans$:EventTransaction = null;
	private datamodel$:DataModel = new DataModel();
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:InterfaceForm)
	{
		this.intfrm = parent;
		Form.models.set(parent,this);
		Logger.log(Type.formbinding,"Create modelform: "+this.intfrm.constructor.name);
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public get parent() : InterfaceForm
	{
		return(this.intfrm);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public get datamodel() : DataModel
	{
		return(this.datamodel$);
	}

	public get eventTransaction() : EventTransaction
	{
		return(this.evttrans$);
	}

	public set eventTransaction(evttrans:EventTransaction)
	{
		this.evttrans$ = evttrans;
	}

	public setEventTransaction() : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx != null && !evttrx.blocked)
		{
			Alert.fatal("Already in transaction","Transaction Failure");
			return;
		}

		if (evttrx) evttrx.join();
		else evttrx = new EventTransaction();

		evttrx.blocked = true;
		this.eventTransaction = evttrx;
	}

	public endEventTransaction() : void
	{
		let evttrx:EventTransaction = this.eventTransaction;

		if (evttrx == null || !evttrx.blocked)
		{
			Alert.fatal("Form not in transaction ","Transaction Failure");
			return;
		}

		evttrx.remove();

		if (evttrx.done())
			this.eventTransaction = null;
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		this.datamodel$.setWrapper(block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.intfrm.constructor.name);
	}

	private async autoquery()
	{
		for(let block of this.blocks.values())
		{
			if (!block.isLinked())
			{
				block.datasource = block.createMemorySource();

				await block.executequery();
				block.datasource.queryable = false;
				block.datasource.insertable = false;
				block.datasource.deleteable = false;
			}
		}
	}

	private linkViews() : void
	{
		this.blocks.forEach((blk) => {blk.linkView()})
	}

	private unlinkViews() : void
	{
		this.blocks.forEach((blk) => {blk.unlinkView()})
	}
}