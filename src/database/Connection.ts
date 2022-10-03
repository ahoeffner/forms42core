/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

import { SQLRest } from "./SQLRest.js";
import { BindValue } from "./BindValue.js";
import { Alert } from "../application/Alert.js";
import { Connection as BaseConnection } from "../public/Connection.js";

export class Connection extends BaseConnection
{
	private conn$:string = null;
	private keepalive$:number = 20;

	public async connect(username?:string, password?:string) : Promise<boolean>
	{
		if (username) this.username = username;
		if (password) this.password = password;

		let payload:any =
		{
			"scope": "transaction",
			"auth.method": "database",
			"username": this.username,
			"auth.secret": this.password
		};

		let response:any = await this.post("connect",payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return(false);
		}

		this.conn$ = response.session;
		this.keepalive$ = (+response.timeout * 4/5)*1000;

		this.keepalive();
		return(true);
	}

	public async select(sql:SQLRest, cursor:string, rows:number) : Promise<Response>
	{
		let payload:any =
		{
			rows: rows,
			compact: true,
			cursor: cursor,

			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		let response:any = await this.post(this.conn$+"/select",payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	public async fetch(cursor:string) : Promise<Response>
	{
		let payload:any = {cursor: cursor};
		let response:any = await this.post(this.conn$+"/exec/fetch",payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	public async lock(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			rows: 1,
			compact: true,
			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		let response:any = await this.post(this.conn$+"/select",payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	public async insert(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.patch(this.conn$+"/insert"+returnclause,payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	public async update(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.patch(this.conn$+"/update"+returnclause,payload);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	public async delete(sql:SQLRest) : Promise<Response>
	{
		let payload:any =
		{
			sql: sql.stmt,
			bindvalues: this.convert(sql.bindvalues)
		};

		let returnclause:string = sql.returnclause ? "?returning=true" : "";
		let response:any = await this.patch(this.conn$+"/delete"+returnclause,payload);

		console.log(response);

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		return(response);
	}

	private async keepalive() : Promise<void>
	{
		await this.sleep(this.keepalive$);

		let response:any = await this.post(this.conn$+"/ping",{keepalive: true});

		if (!response.success)
		{
			Alert.warning(response.message,"Database Connection");
			return;
		}

		this.keepalive();
	}

	private convert(bindv:BindValue[]) : any[]
	{
		let binds:any[] = [];
		if (bindv == null) return([]);

		bindv.forEach((b) =>
		{binds.push({name: b.name, value: b.value, type: b.type})})

		return(binds);
	}

	private sleep(ms:number) : Promise<void>
	{
		return(new Promise(resolve => setTimeout(resolve,ms)));
	}
}

export class Response
{
	public rows:any[];
	public message:string = null;
	public success:boolean = true;
}