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


export class Batch implements Serializable
{
	private response$:Response = null;
	private responses$:Response[] = [];
	private steps$:Serializable[] = [];

	/** Number of steps */
	public size() : number
	{
		return(this.steps$.length);
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

	/** Add step */
	public add(step:Serializable) : void
	{
		this.steps$.push(step);
	}

	/** Get the response for given step */
	public getResponse(step:number) : Response
	{
		return(this.responses$[step]);
	}

	/** Get all responses */
	public getResponses() : Response[]
	{
		return(this.responses$);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<boolean>
	{
		let jdbconn:Connection = Connection.getConnection(conn);

		this.response$ = new Response();
		let response:any = await jdbconn.send(this);
		let success:boolean = this.response$.parse(response);

		response.steps?.forEach((step:any) =>
		{
			let resp:Response = new Response();
			this.responses$.push(resp);
			resp.parse(step);
		})

		return(success);
	}

	public serialize() : any
	{
		let json:any = {};
		json.request = "batch";

		let steps:any[] = [];

		this.steps$.forEach((step) =>
		{steps.push(step.serialize())});

		json.steps = steps;
		return(json);
	}
}