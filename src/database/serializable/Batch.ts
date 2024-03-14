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

import { Connection } from "../Connection";
import { Serializable } from "./Serializable";
import { DatabaseConnection } from "../../public/DatabaseConnection";


export class Batch implements Serializable
{
	private steps$:Serializable[] = [];


	public add(step:Serializable) : void
	{
		this.steps$.push(step);
	}

	/** Execute the statement */
	public async execute(conn:DatabaseConnection) : Promise<any>
	{
		let jsdbconn:Connection = Connection.getConnection(conn);
		return(jsdbconn.send(this));
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


export enum CursorRequest
{
	fetch,
	close
}