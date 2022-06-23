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

import { Record } from "./Record.js";

export class TriggerState
{
	private record$:Record = null;
	private update$:boolean = true;

	public constructor(record?:Record, update?:boolean)
	{
		this.record$ = record;
		if (update != null)	this.update = update;
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
}