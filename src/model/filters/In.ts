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
	private columns$:string[] = null;
	private constraint$:any[][] = null;

	public constructor(columns:string|string[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = columns;
	}

	public clear() : void
	{
		this.constraint$ = null;
	}

	public get constraint() : any|any[]
	{
		return(this.constraint$);
	}

	public set constraint(table:any|any[]|any[][])
	{
		this.constraint$ = null;
		if (table == null) return;

		if (typeof table === "string")
		{
			let list:string[] = [];
			table = table.split(",")

			for (let i = 0; i < table.length; i++)
			{
				if (table[i].length > 0)
					list.push(table[i].trim());
			}

			table = list;
		}

		// Single value
		if (!Array.isArray(table))
			table = [table];

		if (table.length == 0)
			return;

		// List
		if (!Array.isArray(table[0]))
		{
			let list:any[] = table;	table = [];
			list.forEach((elem) => table.push([elem]));
		}

		this.constraint$ = table;
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		let values:any[] = [];
		if (this.columns$ == null) return(false);
		if (this.constraint$ == null) return(false);
		if (this.constraint$.length == 0) return(false);

		let table:any[][] = this.constraint$;

		this.columns$.forEach((column) =>
		{
			column = column?.toLowerCase();
			values.push(record.getValue(column));
		})

		let match:boolean = false;
		for (let r = 0; r < table.length; r++)
		{
			match = true;
			let row:any[] = table[r];

			for (let c = 0; c < row.length; c++)
			{
				if (values[c] != row[c])
				{
					match = false;
					break;
				}
			}

			if (match)
				break;
		}

		return(match);
	}
}