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

import { FilterStructure } from "../model/FilterStructure";

export class SQLStatement
{
	public static select(table:string, columns:string[], filter:FilterStructure, order:string, rows:number) : string
	{
		let stmt:string = "select ";
		columns.forEach((column) => {stmt += column + " "});

		stmt += "from "+table;

		if (filter)
			stmt += " where " + filter.asSQL();

		if (order)
			stmt += " "+order;

		console.log(stmt);
		return(stmt);
	}
}