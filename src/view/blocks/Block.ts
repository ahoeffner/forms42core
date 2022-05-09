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

import { Row } from "./Row.js";


export class Block
{
	private name$:string = null;
	private rows:Map<number,Row> = new Map<number,Row>();


	constructor(name:string)
	{
		if (name == null) name = "";
		this.name$ = name.toLowerCase();
	}

	public get name() : string
	{
		return(this.name$);
	}

	public getRow(row:number, create:boolean) : Row
	{
		let rec:Row = this.rows.get(row);

		if (rec == null)
		{
			rec = new Row();
			if (create) this.rows.set(row,rec);
		}

		return(rec);
	}
}
