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
import { Response } from "./Response.js";
import { DataType } from "../DataType.js";
import { BindValue } from "../BindValue.js";
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { MSGGRP } from "../../messages/Internal.js";
import { Messages } from "../../messages/Messages.js";
import { Cursor as CFunc, CursorRequest as COPR } from "./Cursor.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";

/**
 * SQLStatement is used with OpenRestDB to execute any
 * sql-statement. If repeatable
 */
export class SQLStatement implements Serializable
{
	private pos$:number = 0;
	private source$:string = null;
	private cursor$:Cursor = null;
	private arrayfetch$:number = 1;
	private records$:any[][] = null;
	private columns$:string[] = null;
	private response$:Response = null;
	private jdbconn$:Connection = null;
	private datatypes$:Map<string,DataType|string> = null;
	private bindvalues$:Map<string,BindValue> = new Map<string,BindValue>();

	/** @param connection : A connection to OpenRestDB */
	public constructor(source:string, cursor?:boolean)
	{
		this.source$ = source;

		if (cursor)
		{
			this.cursor = true;
			this.arrayfetch$ = 32;
		}
	}

	/** If something went wrong */
	public failed() : boolean
	{
		return(this.response$.failed);
	}

	/** The error (message) from the backend */
	public error() : string
	{
		return(this.response$.message);
	}

	/** The message from the backend */
	public message() : string
	{
		return(this.response$.message);
	}

	/** Get parsed response */
	public response() : Response
	{
		return(this.response$);
	}

	/** If the statement modyfied the backend */
	public get modyfies() : boolean
	{
		return(this.response$.modifies);
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
		else this.cursor$ = new Cursor(this.source$);
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

	/** Bind datatype */
	public setDataType(name:string, type?:DataType|string) : void
	{
		this.datatypes$.set(name,type);
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
		let response:any = await this.jdbconn$.send(this);

		this.response$ = new Response(this.columns$,this.datatypes$)
		let success:boolean = this.response$.parse(response);

		if (!success)
			this.cursor$ = null;

		if (success)
		{
			if (this.response$.modifies)
				this.jdbconn$.setModified();

			this.records$ = this.response$.records;
			this.datatypes$ = this.response$.datatypes;
		}

		return(success);
	}

	/** Fetch rows, if select statement */
	public async fetch() : Promise<any[]>
	{
		if (!this.response$.more && this.cursor$)
			this.cursor$.eof = true;

		if (this.records$?.length > this.pos$)
			return(this.records$[this.pos$++]);

		if (!this.cursor$)
		{
			Messages.warn(MSGGRP.JWDB,4);
			return(null);
		}

		if (this.cursor$.eof)
			return(null);

		this.pos$ = 0;
		let fetch:CFunc = new CFunc(this.cursor$.name,COPR.fetch);

		let response:any = await this.jdbconn$.send(fetch);
		let success:boolean = this.response$.parse(response);

		if (!success)
			return(null);

		this.records$ = this.response$.records;
		return(this.fetch());
	}

	/** Get return value if 'returning' */
	public getReturnValue(column:string, type?:DataType|string) : any
	{
		return(this.response$.getValue(column));
	}

	/** Close and clean up */
	public async close() : Promise<boolean>
	{
		if (this.cursor$ != null && !this.cursor$.eof)
		{
			let cursor:CFunc = new CFunc(this.cursor$.name,COPR.close);
			this.jdbconn$.send(cursor); // No reason to wait
		}

		this.cursor$ = null;
		this.records$ = null;

		return(true);
	}

	public serialize() : any
	{
		let json:any = {};
		json.request = "execute";
		json.source = this.source$;

		json.describe = true;
		json.arrayfetch = this.arrayfetch$;

		if (this.cursor$)
			json.cursor = this.cursor$.name;

		let bv:any[] = [];

		this.bindvalues$.forEach((value) =>
		  {bv.push(value.serialize());})

		if (bv.length > 0)
			json.bindvalues = bv;

		return(json);
	}
}