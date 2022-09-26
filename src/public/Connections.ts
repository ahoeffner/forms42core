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

import { Connection } from "./Connection.js";

export class Connections
{
	private static conns$:Map<string,Connection> =
		new Map<string,Connection>();

	public static get(name:string) : Connection
	{
		return(Connections.conns$.get(name?.toLowerCase()));
	}

	public static register(conn:Connection) : void
	{
		Connections.conns$.set(conn.name?.toLowerCase(),conn);
	}
}
