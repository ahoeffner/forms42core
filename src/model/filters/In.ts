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


export class In implements Filter
{
	private columns$:string = null;
	private constraint$:any[] = [];

	public constructor(column:string)
	{
		this.columns$ = column;
	}

	public get constraint() : any|any[]
	{
		return(this.constraint$);
	}

	public set constraint(values:any|any[])
	{
		this.constraint$ = [];
		if (values == null) return;

		if (typeof values === "string")
		{
			values = values.split(",")

			for (let i = 0; i < values.length; i++)
			{
				if (values[i].length > 0)
					this.constraint$.push(values[i].trim());
			}
		}
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		let val:any = record.getValue(this.columns$);
		if (this.constraint$.length == 0) return(false);

		for (let c = 0; c < this.constraint$.length; c++)
			if (val == this.constraint$[c]) return(true);

		return(false);
	}
}