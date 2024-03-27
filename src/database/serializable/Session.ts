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

export class Session implements Serializable
{
	public custom:any = null;
	public scope:string = null;
	public token:string = null;
	public method:string = null;
	public clientinfo:any = null;
	public username:string = null;
	public password:string = null;
	private response$:Response = null;

	constructor(private request:SessionRequest)
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

		json.request = "session";
		json.type = SessionRequest[this.request];

		if (this.request == SessionRequest.keepalive)
			json.keepalive = true;

		if (this.scope) json.scope = this.scope;
		if (this.token) json.token = this.token;
		if (this.method) json.method = this.method;

		if (this.username) json.username = this.username;
		if (this.password) json.password = this.password;

		if (this.custom) json.custom = this.custom;
		if (this.clientinfo) json.clientinfo = this.clientinfo;

		return(json);
	}
}

export enum SessionRequest
{
	commit,
	connect,
	release,
	rollback,
	keepalive,
	disconnect
}