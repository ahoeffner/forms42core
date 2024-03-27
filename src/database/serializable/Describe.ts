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

import { Response } from "./Response.js";
import { Connection } from "../Connection.js";
import { Serializable } from "./Serializable.js";
import { DatabaseConnection } from "../../public/DatabaseConnection.js";


export class Describe implements Serializable
{
	private response$:Response = null;

	public constructor(private source:string)
	{
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

	/** Order by clause */
	public get order() : string
	{
		return(this.response$.order);
	}

	/** Columns */
	public get columns() : string[]
	{
		return(this.response$.columns);
	}

	/** Column definitions */
	public get types() : string[]
	{
		let types:string[] = [];
		this.response$.datatypes.forEach((type) => types.push(type));
		return(types);
	}

	/** Column definitions */
	public get datatypes() : Map<string,string>
	{
		return(this.response$.datatypes);
	}

	/** Primary key */
	public get primarykey() : string[]
	{
		return(this.response$.primarykey);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		let jdbconn:Connection = Connection.getConnection(conn);

		this.response$ = new Response();
		let response:any = await jdbconn.send(this);
		let success:boolean = this.response$.parse(response);

		return(success);
	}

	public serialize() : any
	{
		let json:any = {};

		json.request = "describe";
		json.source = this.source;

		return(json);
	}
}