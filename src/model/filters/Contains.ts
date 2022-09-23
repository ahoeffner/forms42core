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
	private constraint$:string[] = null;

	public constructor(columns:string|string[])
	{
		this.columns$ = [];

		if (typeof columns === "string")
		{
			columns.split(",").forEach((column) =>
			{
				column = column.trim();

				if (column.length > 0)
					this.columns$.push(column);
			})
		}

		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = columns;
	}

	public clear() : void
	{
		this.constraint$ = null;
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

	public async evaluate(record:Record) : Promise<boolean>
	{
		let value:string = "";

		if (this.constraint$ == null) return(false);
		if (this.constraint$.length == 0) return(false);

		for (let c = 0; c < this.columns$.length; c++)
			value += " " +  record.getValue(this.columns$[c]?.toLowerCase());

		value = value.toLocaleLowerCase();

		for (let c = 0; c < this.constraint$.length; c++)
			if (!value.includes(this.constraint$[c])) return(false);

		return(true);
	}
}