/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Cursor } from "../Cursor.js";
import { DataType } from "../DataType.js";
import { BindValue } from "../BindValue.js";
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { MSGGRP } from "../../messages/Internal.js";
import { Messages } from "../../messages/Messages.js";
import { DatabaseResponse } from "../DatabaseResponse.js";
import { Cursor as CFunc, CursorRequest as COPR } from "./Cursor.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

/**
 * SQLStatement is used with OpenRestDB to execute any
 * sql-statement
 */
export class SQLStatement implements Serializable
{
	private pos:number = 0;
	private stmt$:string = null;
	private response$:any = null;
	private types:string[] = null;
	private cursor$:Cursor = null;
	private message$:string = null;
	private arrayfetch$:number = 1;
	private records$:any[][] = null;
	private columns$:string[] = null;
	private modyfies$:boolean = false;
	private jdbconn$:Connection = null;
	private bindvalues$:Map<string,BindValue> = new Map<string,BindValue>();

	/** @param connection : A connection to OpenRestDB */
	public constructor(stmt:string, cursor?:boolean)
	{
		this.stmt$ = stmt;

		if (cursor)
		{
			this.cursor = true;
			this.arrayfetch$ = 32;
		}
	}

	/** If the statement modyfied the backend */
	public get modyfies() : boolean
	{
		return(this.modyfies$);
	}

	/** The columns involved in a select statement */
	public get columns() : string[]
	{
		return(this.columns$);
	}

	/** Use a cursor (select type only) */
	public set cursor(flag:boolean)
	{
		if (!flag) this.cursor$ = null;
		else this.cursor$ = new Cursor(this.stmt$);
	}

	/** The number of rows to fetch from a select-statement per call to fetch */
	public get arrayfetch() : number
	{
		return(this.arrayfetch$);
	}

	/** The number of rows to fetch from a select-statement per call to fetch */
	public set arrayfetch(size:number)
	{
		this.arrayfetch$ = size;
	}

	/** The error message from the backend */
	public error() : string
	{
		return(this.message$);
	}

	/** Bind datatype */
	public setDataType(name:string, type?:DataType|string) : void
	{
		this.addBindValue(new BindValue(name,null,type));
	}

	/** Bind values defined with colon i.e. salary = :salary */
	public bind(name:string, value:any, type?:DataType|string) : void
	{
		this.addBindValue(new BindValue(name,value,type));
	}

	/** Bind values defined with colon i.e. salary = :salary */
	public addBindValue(bindvalue:BindValue) : void
	{
		this.bindvalues$.set(bindvalue.name?.toLowerCase(),bindvalue);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		this.jdbconn$ = Connection.getConnection(conn);
		this.response$ = await this.jdbconn$.send(this);

		let success:boolean = this.response$.success;

		if (!success)
		{
			this.cursor$ = null;
			this.message$ = this.response$.message;
		}

		if (this.response$.writes)
			this.modyfies$ = true;

		if (success)
		{
			this.types = this.response$.types;
			this.records$ = this.parse(this.response$);
		}

		return(success);
	}

	/** Fetch rows, if select statement */
	public async fetch() : Promise<any[]>
	{
		if (this.records$?.length > this.pos)
			return(this.records$[this.pos++]);

		if (!this.cursor$)
		{
			Messages.warn(MSGGRP.ORDB,4,this.stmt$);
			return(null);
		}

		if (this.cursor$.eof)
			return(null);

		this.pos = 0;
		let fetch:CFunc = new CFunc(this.cursor$.name,COPR.fetch);

		this.response$ = await this.jdbconn$.send(fetch);

		if (!this.response$.success)
		{
			this.message$ = this.response$.message;
			return(null);
		}

		this.records$ = this.parse(this.response$);
		return(this.fetch());
	}

	/** Get return value if 'returning' */
	public getReturnValue(column:string, type?:DataType|string) : any
	{
		//this.retvals$ = new DatabaseResponse(this.response$,null);
		//let value:any = this.retvals$.getValue(column);

		let value:any = null;

		if (type)
		{
			if (typeof type != "string") type = DataType[type]; type = type.toLowerCase();
			if (type == "date" || type == "datetime" || type == "timestamp") value = new Date(value);
		}

		return(value);
	}

	/** Close and clean up */
	public async close() : Promise<boolean>
	{
		let response:any = null;

		if (this.cursor$ != null && !this.cursor$.eof)
			response = await this.jdbconn$.close(this.cursor$);

		this.cursor$ = null;
		this.records$ = null;

		if (response)
			return(response.success);

		return(true);

	}

	private parse(response:any) : any[][]
	{
		if (!response.success)
		{
			this.cursor$ = null;
			return([]);
		}

		if (!response.rows)
			return([]);

		if (response.rows.length == 0)
			return([]);

		if (!response.columns)
			return(response.rows);

		let rows:any[][] = response.rows;
		let columns:string[] = response.columns;

		let datetypes:string[] = ["date","datetime","timestamp"];

		for (let r = 0; r < rows.length; r++)
		{
			if (Array.isArray(rows[r])) // select
			{
				if (this.types)
				{
					for (let c = 0; c < columns.length; c++)
					{
						if (datetypes.includes(this.types[c].toLowerCase()))
							rows[r][c] = new Date(rows[r][c]);
					}
				}
			}
			else // returning
			{
				Object.keys(rows[r]).forEach((column) =>
				{
					let bv:BindValue = this.bindvalues$.get(column.toLowerCase());

					if (bv && datetypes.includes(bv.type))
						rows[r][column] = new Date(rows[r][column])
				})
			}
		}

		return(rows);
	}


	public serialize() : any
	{
		let json:any = {};
		json.request = "execute";
		json.source = this.stmt$;

		if (this.cursor$)
		{
			json.cursor = this.cursor$.name;
			json.arrayfetch = this.arrayfetch$;
		}

		let bv:any[] = [];

		this.bindvalues$.forEach((value) =>
		  {bv.push(value.serialize());})

		if (bv.length > 0)
			json.bindvalues = bv;

		return(json);
	}
}