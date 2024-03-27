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
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { Parameter, ParameterType } from "../Parameter.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";


/** Defines a procedure or function call */
export class Procedure implements Serializable
{
	protected response$:any = null;
	protected args$:Parameter[] = [];
	protected modyfies$:boolean = false;

	protected types$:Map<string,any> = new Map<string,any>();
	protected values$:Map<string,any> = new Map<string,any>();

	protected ignore$:string[] = ["success","request","instance"];
	protected datetypes$:DataType[] = [DataType.date, DataType.datetime, DataType.timestamp];


	public constructor(private name:string)
	{
		this.name = name;
	}

	/** If everything okay */
	public get success() : boolean
	{
		return(this.response$.success);
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

	/** Add call parameter */
	public addParameter(name:string, value:any, datatype?:DataType|string, paramtype?:ParameterType) : void
	{
		let param:Parameter = new Parameter(name,value,datatype,paramtype);
		this.args$.push(param);
	}

	/** Add call parameter */
	public addOutParameter(name:string, datatype?:DataType|string) : void
	{
		let param:Parameter = new Parameter(name,null,datatype,ParameterType.out);
		this.args$.push(param);
	}

	/** Add call parameter */
	public addInOutParameter(name:string, datatype?:DataType|string) : void
	{
		let param:Parameter = new Parameter(name,null,datatype,ParameterType.inout);
		this.args$.push(param);
	}

	/** If the statement modyfied the backend */
	public get modyfies() : boolean
	{
		return(this.modyfies$);
	}

	/** Get returned value */
	public getValue(name:string) : any
	{
		return(this.values$.get(name.toLowerCase()));
	}

	/** Execute the procedure */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		let jsdbconn:Connection = Connection.getConnection(conn);
		this.response$ = await jsdbconn.send(this);

		if (!this.response$.success)
			return(false);

		if (this.response$.writes)
			this.modyfies$ = true;

		let map:Map<string,Parameter> =
			new Map<string,Parameter>();

		this.args$.forEach((par) =>
		{map.set(par.name.toLowerCase(),par)});

		Object.keys(this.response$).forEach((name) =>
		{
			let pname = name.toLowerCase();
			let parm:Parameter = map.get(pname);

			if (parm)
			{
				let value:any = this.response$[name];

				if (parm.isDate() && typeof value === "number")
					value = new Date(value);

				this.values$.set(pname,value);
			}
		})

		return(true);
	}

	public serialize() : any
	{
		let json:any = {};
		json.request = "invoke";

		json.source = this.name;

		let args:any[] = [];
		this.args$.forEach((arg) => args.push(arg.serialize()));

		if (args.length > 0)
			json.parameters = args;

		return(json);
	}
}