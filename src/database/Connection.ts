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

import { Alert } from "../application/Alert.js";
import { Connection as BaseConnection } from "../public/Connection.js";

export class Connection extends BaseConnection
{
	private conn$:string = null;
	private keepalive$:number = 20;

	public async connect() : Promise<boolean>
	{
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

	public async query(stmt:string) : Promise<any>
	{
		return(null);
	}

	public async fetch(stmt:string) : Promise<any>
	{
		return(null);
	}

	public async insert(stmt:string) : Promise<any>
	{
		return(null);
	}

	public async update(stmt:string) : Promise<any>
	{
		return(null);
	}

	public async delete(stmt:string) : Promise<any>
	{
		return(null);
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

		console.log(JSON.stringify(response))
		this.keepalive();
	}

	public sleep(ms:number) : Promise<void>
	{
		return(new Promise(resolve => setTimeout(resolve,ms)));
	}
}