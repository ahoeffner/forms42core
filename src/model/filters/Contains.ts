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


export class Contains implements Filter
{
	public contraint:string = null;

	private values$:string[] = [];
	private columns$:string[] = [];

	public constructor(columns:string|string[])
	{
		if (Array.isArray(columns)) this.columns$ = columns;
		else						this.columns$.push(columns);
	}

	public set value(value:string)
	{
		this.values$ = [value];
	}

	public set values(values:string[])
	{
		this.values$ = values;
	}

	public async matches(record:Record) : Promise<boolean>
	{
		for (let c = 0; c < this.columns$.length; c++)
		{
			for (let v = 0; v < this.values$.length; v++)
			{
				let val:any = record.getValue(this.columns$[c]);
				if (val != null && (val+"").includes(this.values$[v]))
					return(true);
			}
		}

		return(false);
	}
}