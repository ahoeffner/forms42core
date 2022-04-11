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

import { EventFilter } from "./EventFilter";

export class Event
{
	constructor(public type:string, public source:any)
	{

	}
}


export class Events
{
	private static events:EventFilter[];

	public static raise(event:Event) : void
	{
		for (let i = 0; i < this.events.length; i++)
		{

		}
	}
}
