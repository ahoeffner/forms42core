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
export class Function implements Serializable
{
	private response$:any = null;
	private args$:Parameter[] = [];
	private update$:boolean = false;
	private retarg$:Parameter = null;
	private jdbconn$:Connection = null;

	public constructor(connection:DatabaseConnection, private name?:string)
	{
		this.jdbconn$ = Connection.getConnection(connection);
	}

	/** The name of the stored procedure/function */
	public setName(name:string) : void
	{
		this.name = name;
	}

	/** Add call parameter */
	public addParameter(name:string, value:any, datatype?:DataType|string, paramtype?:ParameterType) : void
	{
		let param:Parameter = new Parameter(name,value,datatype,paramtype);
		this.args$.push(param);
	}

	/** If the procedure changes any values the backend */
	public set update(flag:boolean)
	{
		this.update$ = flag;
	}

	/** Define return value for functions */
	public returns(name:string, type?:DataType|string) : void
	{
		this.retarg$ = new Parameter(name,null,type,ParameterType.out);
	}

	/** Execute the procedure */
	public async execute() : Promise<boolean>
	{
		this.response$ = await this.jdbconn$.send(this);
		console.log(this.response$)
		return(this.response$.success);
	}

	/** The error message from the backend */
	public error() : string
	{
		return(this.response$.message);
	}

	public serialize() : any
	{
		let json:any = {};
		json.function = "invoke";

		json.source = this.name;
		json.update = this.update$;

		let args:any[] = [];
		this.args$.forEach((arg) => args.push(arg.serialize()));

		if (args.length > 0)
			json.parameters = args;

		if (this.retarg$)
			json.returning = this.retarg$.serialize();

		return(json);
	}
}