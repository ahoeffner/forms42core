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
import { datetypes } from "./Serializable.js";
import { MSGGRP } from "../../messages/Internal.js";
import { Messages } from "../../messages/Messages.js";
import { Cursor as CREQ, CursorRequest } from "./Cursor.js";


export class Response
{
	private pos$:number = 0;
	private rows$:any[][] = [];
	private cursor$:Cursor = null;
	private columns$:string[] = null;
	private records$:NameValuePair[][] = [];
	private values$:Map<string,any> = new Map<string,any>();
	private datatypes$:Map<string,string> = new Map<string,string>();


	public constructor(columns?:string[], datatypes?:Map<string,DataType|string>)
	{
		this.columns = columns;
		this.datatypes = datatypes;
	}

	public get cursor() : string
	{
		return(this.cursor$?.name);
	}

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public get datatypes() : Map<string,string>
	{
		return(this.datatypes$);
	}

	public set cursor(cursor:Cursor)
	{
		this.cursor$ = cursor;
	}

	public set columns(columns:string[])
	{
		this.columns$ = [];

		columns?.forEach((column) =>
		{this.columns$.push(column?.toLowerCase())});
	}

	public set datatypes(types:Map<string,DataType|string>)
	{
		this.datatypes$.clear();

		types?.forEach((type,name) =>
		{
			name = name?.toLowerCase();

			if (!(typeof type === "string"))
				type = DataType[type];

			this.datatypes$.set(name,type?.toLowerCase());
		})
	}

	public get rows() : any[][]
	{
		return(this.rows$);
	}

	public getValue(name:string) : any
	{
		return(this.values$.get(name?.toLowerCase()))
	}

	public parse(response:any) : boolean
	{
		this.rows$ = [];
		this.records$ = [];
		this.values$.clear();

		if (!response.success)
			return(false);

		return(this.parseRows(response));
	}

	public fetch() : NameValuePair[]
	{
		if (this.records$?.length > this.pos$)
			return(this.records$[this.pos$++]);

		if (!this.cursor$)
		{
			Messages.warn(MSGGRP.ORDB,4);
			return(null);
		}

		if (this.cursor$.eof)
			return(null);


	}

	private parseRows(response:any) : boolean
	{
		if (response.rows && Array.isArray(response.rows))
			this.rows$ = response.rows;

		if (this.rows$.length > 0 && this.columns$.length > 0)
		{
			let record:NameValuePair[] = [];

			for (let r = 0; r < this.rows$.length; r++)
			{
				if (!Array.isArray(this.rows$[r]))
				{
					this.parseValue(this.rows$[r]);
					continue;
				}

				for (let c = 0; c < this.rows$[r].length; c++)
				{
					let value:any = this.rows$[r][c];

					if (this.datatypes$)
					{
						for (let c = 0; c < this.columns$.length; c++)
						{
							let type:string = this.datatypes$.get(this.columns$[r]);
							if (datetypes.has(type) && typeof value === "number")
								value = new Date(+value);
						}
					}

					record.push(new NameValuePair(this.columns$[r],value));
				}

				this.records$.push(record);
			}
		}

		return(true);
	}

	private parseValue(object:any) : void
	{
		Object.keys(object)?.forEach((key) =>
		{
			let value:any = object[key];
			let column:string = key.toLowerCase();

			if (this.datatypes$)
			{
				let type:string = this.datatypes$.get(column);

				if (datetypes.has(type) && typeof value === "number")
					value = new Date(+value);
			}

			this.values$.set(column,value);
		})
	}
}


export class NameValuePair
{
	public constructor(public name:string, public value:any) {};
}