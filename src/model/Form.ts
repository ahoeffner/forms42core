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
import { FormBacking } from '../application/FormBacking.js';
import { FormMetaData } from '../application/FormMetaData.js';


export class Form
{
	private block$:Block = null;
	private parent$:InterfaceForm = null;
	private datamodel$:DataModel = new DataModel();
	private blocks$:Map<string,Block> = new Map<string,Block>();
	private evttrans$:EventTransaction = new EventTransaction();

	constructor(parent:InterfaceForm)
	{
		this.parent$ = parent;
		FormBacking.setModelForm(parent,this);
		Logger.log(Type.formbinding,"Create modelform: "+this.parent.name);
	}

	public get name() : string
	{
		return(this.constructor.name.toLowerCase());
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public get parent() : InterfaceForm
	{
		return(this.parent$);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks$.get(name));
	}

	public get datamodel() : DataModel
	{
		return(this.datamodel$);
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

		return(true);
	}

	public endEventTransaction(_event:EventType, block:Block, _success:boolean) : void
	{
		this.eventTransaction.finish(block);
	}

	public addBlock(block:Block) : void
	{
		this.datamodel$.setWrapper(block);
		this.blocks$.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.parent.name);
	}

	public async finalize() : Promise<void>
	{
		let meta:FormMetaData = FormMetaData.get(this.parent);

		meta.blockattrs.forEach((block,attr) =>
		{
			let blk:Block = this.getBlock(block.toLowerCase());
			if (blk != null) this.parent[attr] = blk;
		})

		meta.getDataSources().forEach((source,block) =>
		{
			let blk:Block = this.getBlock(block.toLowerCase());
			if (blk != null) blk.datasource = source;
		})

		this.blocks$.forEach((block) =>
			{block.finalize()});

		await this.initControlBlocks();
	}

	public async initControlBlocks()
	{
		for(let block of this.blocks$.values())
		{
			if (block.datasource == null)
			{
				block.datasource = block.createMemorySource();

				block.ctrlblk = true;
				await block.executeQuery();
			}
		}
	}

	public clearEventTransactions() : void
	{
		this.eventTransaction.clear();
	}
}