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

import { Record } from "../model/Record.js";
import { SQLStatement } from "./SQLStatement.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { BindValue } from "./BindValue.js";

export class SQLBuilder
{
	public static select(table:string, columns:string[], filter:FilterStructure, order:string) : SQLStatement
	{
		let stmt:string = "select ";

		for (let i = 0; i < columns.length; i++)
		{
			if (i > 0) stmt += ",";
			stmt += columns[i];
		}

		stmt += " from "+table;

		if (filter)
			stmt += " where " + filter.asSQL();

		if (order)
			stmt += " "+order;

		let parsed:SQLStatement = new SQLStatement();

		parsed.stmt = stmt;
		parsed.bindvalues = filter?.getBindValues();

		return(parsed);
	}

	public static fetch(cursor:string) : SQLStatement
	{
		let parsed:SQLStatement = new SQLStatement();
		parsed.stmt = '{"cursor": "'+ cursor+'" }';
		return(parsed);
	}

	public static insert(table:string, columns:string[], record:Record, returnclause:string) : SQLStatement
	{
		let binds:BindValue[] = [];
		let stmt:string = "insert into "+table+"(";

		for (let i = 0; i < columns.length; i++)
		{
			if (i > 0) stmt += ",";
			stmt += columns[i];
		}

		stmt += ") values (";

		for (let i = 0; i < columns.length; i++)
		{
			if (i > 0) stmt += ",";
			stmt += ":"+columns[i];

			binds.push(new BindValue(columns[i],record.getValue(columns[i])))
		}

		stmt += ") "+returnclause;

		let parsed:SQLStatement = new SQLStatement();

		parsed.stmt = stmt;
		parsed.bindvalues = binds;

		return(parsed);
	}

	public static update(table:string, columns:string[], record:Record, returnclause:string) : SQLStatement
	{
		return(null);
	}

	public static delete(table:string, record:Record, returnclause:string) : SQLStatement
	{
		return(null);
	}
}