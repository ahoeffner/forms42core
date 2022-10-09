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

import { SQLRest } from "./SQLRest.js";
import { DataType } from "./DataType.js";
import { Alert } from "../application/Alert.js";
import { Connection } from "../public/Connection.js";
import { SQLRestBuilder } from "./SQLRestBuilder.js";
import { Parameter, ParameterType } from "./Parameter.js";
import { Connection as DatabaseConnection } from "./Connection.js";

export class DatabaseProcedure
{
	private name$:string;
	private patch$:boolean = false;
	private params$:Parameter[] = [];
	private conn$:DatabaseConnection = null;

	constructor(connection:Connection)
	{
		if (!(connection instanceof DatabaseConnection))
		{
			Alert.fatal("Connection for database procedure '"+connection.name+"' is not a DatabaseConnection","Database Procedure");
			return;
		}

		this.conn$ = connection;
	}

	public set patch(flag:boolean)
	{
		this.patch$ = flag;
	}

	public setName(name:string) : void
	{
		this.name$ = name;
	}

	public addParameter(name:string, value:any, datatype?:DataType|string, paramtype?:ParameterType)
	{
		let p:Parameter = new Parameter(name,value,datatype,paramtype);
		this.params$.push(p);
	}

	public async execute() : Promise<boolean>
	{
		let sql:SQLRest = SQLRestBuilder.proc(this.name$,this.params$);
		let response:any = await this.conn$.call(this.patch$,sql);
		console.log(response);
		return(response.success);
	}
}