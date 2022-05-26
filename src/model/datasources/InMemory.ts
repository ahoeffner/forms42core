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

import { Form } from "../../model/Form.js";
import { Block } from "../../public/Block.js";
import { Record } from "../interfaces/Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataSource } from "../interfaces/DataSource.js";
import { EventType } from "../../control/events/EventType.js";
import { FormEvent, FormEvents } from "../../control/events/FormEvents.js";

export class InMemory implements DataSource
{
	private block$:Block = null;
	private records:Record[] = [];

	constructor(block:Block)
	{
		this.block$ = block;
	}

	public async delete(rec:number) : Promise<boolean>
	{
		delete this.records[rec];
		return(true);
	}

	public async insert(record:Record) : Promise<boolean>
	{
		record.recno = this.records.length;
		this.records.push(record);
		return(true);
	}

	public async update(record:Record) : Promise<boolean>
	{
		this.records[record.recno] = record;
		return(true);
	}

	public async query(filters:Filter[]) : Promise<boolean>
	{
		return(true);
	}

	private async fire(type:EventType) : Promise<boolean>
	{
		return(FormEvents.raise(FormEvent.newBlockEvent(type,this.block$.form,this.block$.name)));
	}
}