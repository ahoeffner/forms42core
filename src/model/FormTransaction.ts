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
import { Block as ViewBlock } from "../view/Block.js";
import { BlockTransaction } from "./BlockTransaction.js";
import { Field } from "../view/fields/Field.js";
import { Record } from "./Record.js";

export class FormTransaction
{
	private trx:Map<string,BlockWrapper> =
		new Map<string,BlockWrapper>();

	public constructor(block:Block, offset?:number)
	{
		this.trx.set(block.name,new BlockWrapper(block,offset));
	}

	public setRecord(block:Block, record:Record, apply:boolean)
	{

	}

	public getValue(block:Block|ViewBlock, field:string) : any
	{
		let wrp:BlockWrapper = this.trx.get(block.name);
		if (block instanceof ViewBlock) block = block.model;

		if (wrp == null)
		{
			let fld:Field = block.view.getField(field);
			if (fld != null) return(fld.getValue());
			else return(block.getValue(field));
		}

		return(wrp.blktrx.getValue(field));
	}

	public setValue(block:Block|ViewBlock, field:string, value:any) : any
	{
		let wrp:BlockWrapper = this.trx.get(block.name);
		if (block instanceof ViewBlock) block = block.model;

		if (wrp == null)
		{
			wrp = new BlockWrapper(block,0,true);
			this.trx.set(block.name,wrp);
		}

		return(wrp.blktrx.setValue(field,value));
	}
}

class BlockWrapper
{
	offset:number = 0;
	block:Block = null;
	apply:boolean = true;
	blktrx:BlockTransaction = null;

	constructor(block:Block, offset:number, apply:boolean)
	{
		this.block = block;
		this.apply = apply;
		if (offset != null) this.offset = offset;
		this.blktrx = new BlockTransaction(block.getRecord(this.offset));
	}
}