/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Block } from "./Block.js";
import { Record } from "./Record.js";
import { EventType } from "../control/events/EventType.js";
import { FormsModule } from "../application/FormsModule.js";

export class EventTransaction
{
	private transactions:Map<string,Map<EventType,Transaction>> =
		new Map<string,Map<EventType,Transaction>>();

	public start(event:EventType, block:Block, record:Record) : EventType
	{
		// Ensure only 1 event is running, but
		// too complicated for the common developer

		this.setTrxSlot(block,new Transaction(event,block,record));
		return(null);
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
		let trxmap:Map<EventType,Transaction> = this.transactions.get(block?.name);
		return(trxmap?.get(trxmap.keys().next().value).event);
	}

	public getRecord(block:Block) : Record
	{
		let trxmap:Map<EventType,Transaction> = this.transactions.get(block?.name);
		return(trxmap?.get(trxmap.keys().next().value).record);
	}

	public getTrxSlot(block:Block) : EventType
	{
		let trxmap:Map<EventType,Transaction> = this.transactions.get(block?.name);

		if (trxmap && trxmap.size > 0)
		{
			let keys:EventType[] = Array.from(trxmap.keys());

			let events:string = EventType[keys[0]];
			for (let i = 1; i < keys.length; i++)  events += "," + EventType[keys[i]];

			// Dangerous
			if (!FormsModule.production)
			{
				if (!block)	console.log("Warning, multiple transactions running ("+events+")");
				else console.log("Warning, multiple transactions running on block "+block.name+" ["+events+"]");
			}
		}

		return(null);
	}

	private setTrxSlot(block:Block, newtrx:Transaction) : void
	{
		let trxmap:Map<EventType,Transaction> = this.transactions.get(block?.name);

		if (!trxmap)
		{
			trxmap = new Map<EventType,Transaction>();

			trxmap.set(newtrx.event,newtrx);
			this.transactions.set(block?.name,trxmap);
		}
		else
		{
			let keys:EventType[] = Array.from(trxmap.keys());

			let events:string = "";
			for (let i = 0; i < keys.length; i++)  events += EventType[keys[i]] + ",";
			events += EventType[newtrx.event];

			// Dangerous
			if (!FormsModule.production)
			{
				if (!block)	console.log("Warning, multiple transactions running ("+events+")");
				else console.log("Warning, multiple transactions running on block "+block.name+" ["+events+"]");
			}
		}
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