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
	private columns$:string[] = [];
	private constraint$:string[] = [];

	public constructor(columns:string)
	{
		columns.split(",").forEach((column) =>
		{
			column = column.trim();

			if (column.length > 0)
				this.columns$.push(column);
		})
	}

	public get constraint() : string|string[]
	{
		return(this.constraint$);
	}

	public set constraint(values:string|string[])
	{
		this.constraint$ = [];
		if (values == null) return;

		if (!Array.isArray(values))
			values = values.split(" ")

		for (let i = 0; i < values.length; i++)
		{
			if (values[i].length > 0)
				this.constraint$.push(values[i].trim().toLocaleLowerCase());
		}
	}

	public async matches(record:Record) : Promise<boolean>
	{
		let val:string = "";

		if (this.constraint$.length == 0)
			return(true);

		for (let c = 0; c < this.columns$.length; c++)
			val += " " +  record.getValue(this.columns$[c]);

		val = val.toLocaleLowerCase();

		for (let c = 0; c < this.constraint$.length; c++)
			if (!val.includes(this.constraint$[c])) return(false);

		return(true);
	}
}