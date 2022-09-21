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

import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";


export class Null implements Filter
{
	private column$:string = null;
	private constraint$:string = null;

	public constructor(column:string)
	{
		this.column$ = column;
	}

	public clear() : void
	{
		this.constraint$ = null;
	}

	public get constraint() : any|any[]
	{
		return(this.constraint$);
	}

	public set constraint(value:any|any[])
	{
		this.constraint$ = value;
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		if (this.column$ == null) return(false);
		return(record.getValue(this.column$.toLowerCase()) == null);
	}
}