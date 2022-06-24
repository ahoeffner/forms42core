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
import { Field } from "../view/fields/Field.js";
import { Block as ViewBlock } from "../view/Block.js";

export class EventTransaction
{
	private trx:Map<string,BlockTransaction> =
		new Map<string,BlockTransaction>();

	public constructor(block:Block, record?:Record, offset?:number, applyvw?:boolean)
	{
		if (offset == null) offset = 0;
		if (applyvw == null) applyvw = true;
		if (record == null) record = block.getRecord(offset);
		this.trx.set(block.name,new BlockTransaction(block,record,offset,applyvw));
	}


	public getValue(block:Block|ViewBlock, field:string) : any
	{
		let trx:BlockTransaction = this.trx.get(block.name);
		if (block instanceof ViewBlock) block = block.model;

		if (trx == null)
		{
			let fld:Field = block.view.getField(field);
			if (fld != null) return(fld.getValue());
			else return(block.getValue(field));
		}

		return(trx.getValue(field));
	}

	public setValue(block:Block|ViewBlock, field:string, value:any) : boolean
	{
		let trx:BlockTransaction = this.trx.get(block.name);
		if (block instanceof ViewBlock) block = block.model;

		if (trx == null)
		{
			let record:Record = block.getRecord(0);
			trx = new BlockTransaction(block,record,0,true);
			this.trx.set(block.name,trx);
		}

		return(trx.setValue(field,value));
	}

	public apply() : void
	{
		this.trx.forEach((trx) => {trx.apply()});
	}
}

class BlockTransaction
{
	offset:number = 0;
	block:Block = null;
	record:Record = null;
	wrkcpy:Record = null;
	applyvw:boolean = true;

	constructor(block:Block, record:Record, offset:number, applyvw:boolean)
	{
		this.block = block;
		this.offset = offset;
		this.record = record;
		this.applyvw = applyvw;
	}

	public getValue(field:string) : any
	{
		if (this.wrkcpy == null)
		{
			let fld:Field = this.block.view.getField(field);

			if (fld != null)
				return(fld.getValue());

			return(this.block.getValue(field));
		}

		return(this.wrkcpy.getValue(field));
	}

	public setValue(field:string, value:any) : boolean
	{
		if (this.wrkcpy == null)
		{
			this.wrkcpy = new Record(null);

			this.record.values.forEach((column) =>
			{this.wrkcpy.setValue(column.name,column.value)})
		}

		this.wrkcpy.setValue(field,value);
		return(true);
	}

	public apply() : void
	{
		if (this.wrkcpy == null)
			return;

		this.wrkcpy.values.forEach((column) =>
		{this.record.setValue(column.name,column.value)});

		if (this.applyvw)
		{
			let rownum:number = this.block.view.row;
			this.block.view.refresh(rownum+this.offset,this.record);
		}
	}
}