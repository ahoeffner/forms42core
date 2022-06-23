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

import { Block } from "../view/Block.js";
import { Record } from "./Record.js";

export class TriggerState
{
	private row$:number = null;
	private block$:Block = null;
	private dirty$:boolean = true;

	private record$:Record = null;
	private update$:boolean = true;

	public constructor(record?:Record, update?:boolean)
	{
		this.record$ = record;
		if (update != null)	this.update = update;
	}

	public get row() : number
	{
		return(this.row$);
	}

	public set row(row:number)
	{
		this.row$ = row;
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public set block(block:Block)
	{
		this.block$ = block;
	}

	public get record() : Record
	{
		if (this.record$ == null)
			this.record$ = new Record(null,null);

		return(this.record$);
	}

	public set record(record:Record)
	{
		this.record$ = record;
	}

	public get dirty() : boolean
	{
		return(this.dirty$);
	}

	public set dirty(dirty:boolean)
	{
		this.dirty$ = dirty;
	}

	public get update() : boolean
	{
		return(this.update$);
	}

	public set update(update:boolean)
	{
		this.update$ = update;
	}

	public setRecord(record:Record) : TriggerState
	{
		this.record$ = record;
		return(this);
	}

	public setUpdate(update:boolean) : TriggerState
	{
		this.update$ = update;
		return(this);
	}

	public applychanges() : void
	{
		if (this.block != null && this.dirty)
			this.block$.display(this.row,this.record);
	}
}