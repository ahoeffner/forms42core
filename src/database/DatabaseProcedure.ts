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
	private response$:any = null;
	private patch$:boolean = false;
	private params$:Parameter[] = [];
	private conn$:DatabaseConnection = null;
	private values$:Map<string,any> = new Map<string,any>();

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

	public getOutParameter(name:string) : any
	{
		return(this.values$.get(name?.toLowerCase()));
	}

	public getOutParameterNames() : string[]
	{
		return([...this.values$.keys()]);
	}

	public async execute() : Promise<boolean>
	{
		let name:string = null;
		let names:string[] = null;

		let sql:SQLRest = SQLRestBuilder.proc(this.name$,this.params$);
		this.response$ = await this.conn$.call(this.patch$,sql);

		names = Object.keys(this.response$);

		for (let i = 1; i < names.length; i++)
		{
			name = names[i].toLowerCase();
			this.values$.set(name,this.response$[names[i]]);
		}

		console.log(this.response$);
		return(this.response$.success);
	}
}