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

import { Connection as BaseConnection } from "../public/Connection.js";

export class Connection extends BaseConnection
{
	private conn:string = null;

	public async connect() : Promise<boolean>
	{
		let payload:any =
		{
			"scope": "transaction",
			"auth.method": "database",
			"username": this.quote(this.username),
			"auth.secret": this.quote(this.password)
		};

		let response:any = await this.post("connect",payload);

		console.log(JSON.stringify(response));

		return(true);
	}

	private quote(element:string) : string
	{
		return('"'+element+'"');
	}
}