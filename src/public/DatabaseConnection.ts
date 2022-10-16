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

import { Connection } from "../database/Connection.js";

export class DatabaseConnection
{
	private conn$:Connection = null;

	public constructor(name:string, url?:string|URL)
	{
		this.conn$ = new Connection(name,url);
	}

	public async connect(username?:string, password?:string) : Promise<boolean>
	{
		return(this.conn$.connect(username,password));
	}
}