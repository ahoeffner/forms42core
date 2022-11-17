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

import { Cursor } from "./Cursor.js";
import { SQLRest } from "./SQLRest.js";
import { DataType } from "./DataType.js";
import { BindValue } from "./BindValue.js";
import { Connection } from "./Connection.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";

export class SQLStatement
{
	private sql$:string = null;
	private eof$:boolean = true;
	private record$:any[] = null;
	private response$:any = null;
	private types:string[] = null;
	private cursor$:Cursor = null;
	private patch$:boolean = false;
	private message$:string = null;
	private conn$:Connection = null;
	private columns$:string[] = null;
	private bindvalues$:Map<string,BindValue> = new Map<string,BindValue>();

	public constructor(connection:DatabaseConnection)
	{
		this.conn$ = connection["conn$"];
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

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public error() : string
	{
		return(this.message$);
	}

	public bind(name:string, value:any, type?:DataType|string) : void
	{
		this.addBindValue(new BindValue(name,value,type));
	}

	public addBindValue(bindvalue:BindValue) : void
	{
		this.bindvalues$.set(bindvalue.name?.toLowerCase(),bindvalue);
	}

	public async execute() : Promise<boolean>
	{
		if (this.sql$ == null) return(false);
		let type:string = this.sql$.trim().substring(0,6);

		let sql:SQLRest = new SQLRest();

		sql.stmt = this.sql$;
		sql.bindvalues = [...this.bindvalues$.values()];

		if (type == "select")
		{
			this.cursor$ = new Cursor();
			this.cursor$.name = "sql"+(new Date().getTime());
		}

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
		{
			this.cursor$ = null;
			this.message$ = this.response$.message;
		}

		if (success && type == "select")
		{
			this.types = this.response$.types;
			this.columns$ = this.response$.columns;
			this.record$ = this.parse(this.response$);
		}

		return(success);
	}

	public async fetch() : Promise<any[]>
	{
		let record:any[] = null;

		if (!this.cursor$)
			return(null);

		if (this.record$ != null)
		{
			record = this.record$;
			this.record$ = null;
			return(record);
		}

		if (this.eof$)
			return(null);

		this.response$ = await this.conn$.fetch(this.cursor$);

		if (!this.response$.success)
		{
			this.message$ = this.response$.message;
			return(null);
		}

		record = this.parse(this.response$);
		return(record);
	}

	public async close() : Promise<boolean>
	{
		let response:any = null;

		if (this.cursor$ != null && !this.eof$)
			response = await this.conn$.close(this.cursor$);

		this.eof$ = true;
		this.record$ = null;
		this.cursor$ = null;

		if (response)
			return(response.success);

		return(true);

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
		let columns:string[] = response.columns;

		let datetypes:string[] = ["date","datetime","timestamp"];

		for (let i = 0; i < columns.length; i++)
		{
			if (datetypes.includes(this.types[i].toLowerCase()))
				row[i] = new Date(row[i]);
		}

		return(row);
	}
}