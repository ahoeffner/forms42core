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
import { BindValue } from "./BindValue.js";
import { Alert } from "../application/Alert.js";
import { Connection } from "../public/Connection.js";
import { Connection as DatabaseConnection } from "./Connection.js";

export class SQLStatement
{
	private sql$:string = null;
	private eof$:boolean = true;
	private record$:any[] = null;
	private response$:any = null;
	private cursor$:string = null;
	private patch$:boolean = false;
	private conn$:DatabaseConnection = null;
	private bindvalues$:Map<string,BindValue> = new Map<string,BindValue>();

	public constructor(connection:Connection)
	{
		if (!(connection instanceof DatabaseConnection))
		{
			Alert.fatal("Connection for database procedure '"+connection.name+"' is not a DatabaseConnection","Database Procedure");
			return;
		}

		this.conn$ = connection;
	}

	public get sql() : string
	{
		return(this.sql);
	}

	public set sql(sql:string)
	{
		this.sql$ = sql;
	}

	public set patch(flag:boolean)
	{
		this.patch$ = flag;
	}

	public addBindValue(bindvalue:BindValue) : void
	{
		this.bindvalues$.set(bindvalue.name?.toLowerCase(),bindvalue);
	}

	public async fetch() : Promise<any[]>
	{
		if (!this.cursor$)
			return(null);

		if (this.record$ != null)
		{
			let exist:any[] = this.record$;
			this.record$ = null;
			return(exist);
		}

		if (this.eof$)
			return(null);

		this.response$ = await this.conn$.fetch(this.cursor$);
		this.record$ = this.parse(this.record$);

		return(this.record$);
	}

	public async execute() : Promise<boolean>
	{
		if (this.sql$ == null) return(false);
		let type:string = this.sql$.substring(0,6);

		let sql:SQLRest = new SQLRest();

		sql.stmt = this.sql$;
		sql.bindvalues = [...Object.values(this.bindvalues$)];

		if (type == "select")
			this.cursor$ = "sql"+(new Date().getTime());

		switch(type?.toLowerCase())
		{
			case "insert" : this.response$ = await this.conn$.insert(sql); break;
			case "update" : this.response$ = await this.conn$.update(sql); break;
			case "delete" : this.response$ = await this.conn$.delete(sql); break;
			case "select" : this.response$ = await this.conn$.select(sql,this.cursor$,1,true); break;

			default: this.response$ = await this.conn$.execute(this.patch$,sql);
		}

		let success:boolean = this.response$.success;

		if (!success)
			this.cursor$ = null;

		if (success && type == "select")
			this.record$ = this.parse(this.response$);

		return(success);
	}

	private parse(response:any) : any[]
	{
		this.eof$ = !response.more;

		if (!response.success)
		{
			this.eof$ = true;
			return(null);
		}

		if (response.rows.length == 0)
			return(null);

		let row:any[] = response.rows[0];

		let types:string[] = response.types;
		let columns:string[] = response.columns;

		let datetypes:string[] = ["date","datetime","timestamp"];

		for (let i = 0; i < columns.length; i++)
		{
			if (datetypes.includes(types[i].toLowerCase()))
				row[i] = new Date(row[i]);
		}

		return(row);
	}
}