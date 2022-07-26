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

import { Block } from "./Block.js";
import { Record } from "./Record.js";
import { EventType } from "../control/events/EventType.js";

export class EventTransaction
{
	private NAP:number = 10;
	private TIMEOUT:number = 3000;

	private transactions:Map<string,Transaction> =
		new Map<string,Transaction>();

	public async start(event:EventType, block:Block, record:Record) : Promise<boolean>
	{
		if (!await this.getTrxSlot(block))
			return(false);

		this.transactions.set(block?.name,new Transaction(event,block,record));
		return(true);
	}

	public running() : number
	{
		return(this.transactions.size);
	}

	public clear() : void
	{
		this.transactions.clear();
	}

	public finish(block:Block) : void
	{
		this.transactions.delete(block?.name);
	}

	public getEvent(block:Block) : EventType
	{
		return(this.transactions.get(block?.name)?.event);
	}

	public getRecord(block:Block) : Record
	{
		return(this.transactions.get(block?.name)?.record);
	}

	public async getTrxSlot(block:Block) : Promise<boolean>
	{
		let start:number = new Date().getTime();
		let trx:Transaction = this.transactions.get(block?.name);

		while(trx != null)
		{
			await this.sleep(this.NAP);
			let now:number = new Date().getTime();
			if (now - start > this.TIMEOUT) break;
			trx = this.transactions.get(block?.name);
		}

		return(trx == null);
	}

	private sleep(ms:number) : Promise<void>
    {
        return(new Promise(resolve => setTimeout(resolve,ms)));
    }
}

class Transaction
{
	block:Block = null;
	record?:Record = null;
	event:EventType = null;

	constructor(event:EventType, block:Block, record:Record)
	{
		this.event = event;
		this.block = block;
		this.record = record;
	}
}
