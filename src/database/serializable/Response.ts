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

import { DataType } from "../DataType.js";
import { datetypes } from "../BindValue.js";
import { MSGGRP } from "../../messages/Internal.js";
import { Messages } from "../../messages/Messages.js";


export class Response
{
	private raw$:any = null;
	private affected$:number = 0;
	private order$:string = null;
	private assert$:string = null;
	private more$:boolean = false;
	private lock$:boolean = false;
	private records$:any[][] = [];
	private message$:string = null;
	private success$:boolean = false;
	private columns$:string[] = null;
	private modifies$:boolean = false;
	private primarykey$:string[] = null;
	private violations$:Violation[] = [];
	private values$:Map<string,any> = new Map<string,any>();
	private datatypes$:Map<string,string> = new Map<string,string>();


	public constructor(columns?:string[], datatypes?:Map<string,DataType|string>)
	{
		this.columns = columns;
		this.datatypes = datatypes;
	}

	/** Get the raw response */
	public get response() : any
	{
		return(this.raw$);
	}

	/** Has more records */
	public get more() : boolean
	{
		return(this.more$);
	}

	/** If something went wrong */
	public get failed() : boolean
	{
		return(!this.success$);
	}

	/** The error (message) from the backend */
	public error() : string
	{
		return(this.message);
	}

	/** Get assert failure */
	public get assert() : string
	{
		return(this.assert$);
	}

	/** Was changed by another user */
	public get changed() : boolean
	{
		return(this.assert$?.includes("changed"));
	}

	/** Was changed by another user */
	public get deleted() : boolean
	{
		return(this.assert$?.includes("deleted"));
	}

	/** Has more records */
	public get locked() : boolean
	{
		return(this.lock$);
	}

	/** Get order by */
	public get order() : string
	{
		return(this.order$);
	}

	/** Get columns */
	public get columns() : string[]
	{
		return(this.columns$);
	}

	/** Get primary key */
	public get primarykey() : string[]
	{
		return(this.primarykey$);
	}

	/** Get records */
	public get records() : any[][]
	{
		return(this.records$);
	}

	/** Get backend message */
	public get message() : string
	{
		return(this.message$);
	}

	/** Get rows affected */
	public get affected() : number
	{
		return(this.affected$);
	}

	/** Did request modify backend */
	public get modifies() : boolean
	{
		return(this.modifies$);
	}

	/** Get assertion violations */
	public get violations() : Violation[]
	{
		return(this.violations$);
	}

	/** Get datatypes */
	public get datatypes() : Map<string,string>
	{
		return(this.datatypes$);
	}

	/** Get response value */
	public getValue(name:string) : any
	{
		return(this.values$.get(name?.toLowerCase()))
	}

	/** Parse a raw response from jwb */
	public parse(response:any) : boolean
	{
		this.records$ = [];
		this.values$.clear();

		this.raw$ = response;
		this.more$ = response.more;
		this.lock$ = response.lock;
		this.order$ = response.order;
		this.assert$ = response.assert;
		this.success$ = response.success;
		this.message$ = response.message;
		this.modifies$ = response.writes;
		this.affected$ = response.affected;
		this.primarykey$ = response.primarykey;

		response.violations?.forEach((violation:any) =>
		{
			let found:any = violation.found;
			let column:string = violation.column;
			let expected:any = violation.expected;
			this.violations$.push(new Violation(column,expected,found));
		})

		if (!this.success$)
			return(false);

		return(this.parseRows(response));
	}

	private set columns(columns:string[])
	{
		this.columns$ = [];

		columns?.forEach((column) =>
		{this.columns$.push(column?.toLowerCase())});
	}

	private set datatypes(types:Map<string,DataType|string>)
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

	private parseRows(response:any) : boolean
	{
		let rows:any[][] = [];

		if (response.rows && Array.isArray(response.rows))
			rows = response.rows;

		if (response.columns)
		{
			this.columns$ = [];
			response.columns.forEach((column:string) =>
			{this.columns$.push(column.toLowerCase())})
		}

		if (response.types)
		{
			for (let i = 0; i < response.types.length; i++)
			{
				let type:string = response.types[i];
				this.datatypes$.set(this.columns$[i],type.toLowerCase());
			}
		}

		if (rows.length > 0 && this.columns$.length > 0)
		{
			for (let r = 0; r < rows.length; r++)
			{
				let record:any[] = [];

				if (!Array.isArray(rows[r]))
				{
					this.parseValue(rows[r]);
					continue;
				}

				for (let c = 0; c < rows[r].length; c++)
				{
					let value:any = rows[r][c];

					if (this.datatypes$)
					{
						for (let c = 0; c < this.columns$.length; c++)
						{
							let type:string = this.datatypes$.get(this.columns$[r]);
							if (datetypes.has(type) && typeof value === "number")
								value = new Date(+value);
						}
					}

					record.push(value);
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

export class Violation
{
	constructor(public column:string, public expected:any, public found:any) {};

	public toString() : string
	{
		return(Messages.parse(MSGGRP.JWDB,6,[this.column, this.expected, this.found]));
	}
}