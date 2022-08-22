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
import { Record } from './Record.js';
import { DataModel } from './DataModel.js';
import { Alert } from '../application/Alert.js';
import { Logger, Type } from '../application/Logger.js';
import { DataSource } from './interfaces/DataSource.js';
import { EventTransaction } from './EventTransaction.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { EventType } from '../control/events/EventType.js';


export class Form
{
	private static models:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	public static drop(parent:InterfaceForm) : void
	{
		let remove:string[] = [];
		let form:Form = Form.models.get(parent);

		form.unlinkViews();
		form.clearEventTransactions();

		form.blocks.forEach((blk) =>
		{
			if (!blk.isLinked())
			{
				remove.push(blk.name);
				form.datamodel.clear(blk);
			}
		});

		remove.forEach((name) =>
		{form.blocks.delete(name)});
	}

	public static createForm(parent:InterfaceForm, page:string|HTMLElement) : void
	{
		let form:Form = new Form(parent,page);
		Form.models.set(parent,form);
	}

	public static getForm(parent:InterfaceForm) : Form
	{
		return(Form.models.get(parent));
	}

	public static finalize(parent:InterfaceForm) : void
	{
		let form:Form = Form.models.get(parent);
		form.blocks.forEach((block) => {block.finalize()})
		form.linkViews();
	}

	private block$:Block = null;
	private intfrm:InterfaceForm = null;
	private page$:string|HTMLElement = null;
	private datamodel$:DataModel = new DataModel();
	private blocks:Map<string,Block> = new Map<string,Block>();
	private evttrans$:EventTransaction = new EventTransaction();

	private constructor(parent:InterfaceForm, page:string|HTMLElement)
	{
		this.page$ = page;
		this.intfrm = parent;
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

	public get page() : string|HTMLElement
	{
		return(this.page$);
	}

	public setDataSource(blk:string,source:DataSource) : void
	{
		let block:Block = this.getBlock(blk);
		if (block) block.datasource = source;
		else this.datamodel.setDataSource(blk,source);
	}

	public get eventTransaction() : EventTransaction
	{
		return(this.evttrans$);
	}

	public hasEventTransaction(block:Block) : boolean
	{
		return(this.eventTransaction.getEvent(block) != null);
	}

	public checkEventTransaction(event:EventType, block:Block) : boolean
	{
		let running:EventType = this.eventTransaction.getEvent(block);

		if (running != null)
			Alert.fatal("Cannot start transaction "+EventType[event]+" while running "+EventType[running],"Transaction Violation");

		return(running == null);
	}

	public async wait4EventTransaction(event:EventType, block:Block) : Promise<boolean>
	{
		if (!await this.eventTransaction.getTrxSlot(block))
		{
			let running:EventType = this.eventTransaction.getEvent(block);
			Alert.fatal("Cannot start transaction "+EventType[event]+" while running "+EventType[running],"Transaction Violation");
			return(false);
		}

		return(true);
	}

	public async setEventTransaction(event:EventType, block:Block, record:Record) : Promise<boolean>
	{
		if (!await this.eventTransaction.start(event,block,record))
		{
			let running:EventType = this.eventTransaction.getEvent(block);
			Alert.fatal("Cannot start transaction "+EventType[event]+" while running "+EventType[running],"Transaction Violation");
			return(false);
		}
	}

	public endEventTransaction(_event:EventType, block:Block, _success:boolean) : void
	{
		this.eventTransaction.finish(block);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		this.datamodel$.setWrapper(block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.intfrm.constructor.name);
	}

	public async initControlBlocks()
	{
		for(let block of this.blocks.values())
		{
			if (block.datasource == null)
			{
				block.datasource = block.createMemorySource();

				block.ctrlblk = true;
				await block.executeQuery();
			}
		}
	}

	private clearEventTransactions() : void
	{
		this.eventTransaction.clear();
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