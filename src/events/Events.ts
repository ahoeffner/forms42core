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
import { EventListener } from "./EventListener";


export enum EventType
{
	Key,
    Lock,
	NewForm,
	Connect,
	Disconnect,
    MouseClick,
    MouseDoubleClick,
    PreField,
    PostField,
    PostChange,
    PreviousField,
    NextField,
    PreviousBlock,
    NextBlock,
    KeyEnterQuery,
    KeyExecuteQuery,
    WhenValidateField,
    WhenValidateRecord,
    OnNewRecord,
    PreQuery,
    PostQuery,
    PreInsert,
    PreUpdate,
    PreDelete
}

export class EventSource
{
	constructor(public source:string) {}
}

export class FieldEventSource
{
	constructor(public field:string, public block:string) {}
}

export class KeyEventSource
{
	constructor(public key:any, public field:string, public block:string) {}
}


export class Event
{
	constructor(public type:EventType, public source:string|EventSource|FieldEventSource|KeyEventSource)
	{
		if (typeof source === "string")
			source = new EventSource(source);
	}
}


export class Events
{
	private static listeners:EventListener[];

	public static addListener(listener:EventListener) : void
	{
		if (listener.filters != null)
		{
			for (let i = 0; i < listener.filters.length; i++)
			{
				let filter:EventFilter = listener.filters[i];
				if (filter.field != null) filter.field = filter.field.toLowerCase();
				if (filter.block != null) filter.block = filter.block.toLowerCase();
				if (filter.source != null) filter.source = filter.source.toLowerCase();
			}
		}

		Events.listeners.push(listener);
	}

	public static raise(event:Event) : void
	{
		if (event.source instanceof EventSource)
		{
			if (event.source.source != null)
				event.source.source = event.source.source.toLowerCase();
		}
		else
		{
			if (event.source["field"] != null)
				event.source["field"] = event.source["field"].toLowerCase();
		}

		for (let i = 0; i < Events.listeners.length; i++)
		{
			let done:boolean = false;
			for(let f = 0; f < Events.listeners[i].filters.length && !done; f++)
			{
				let filter:EventFilter = Events.listeners[i].filters[f];

				if (event.type == filter.type)
				{
					if (Events.match(event,filter))
					{
						done = true;
						console.log("match");
					}
				}
			}
		}
	}

	private static match(event:Event, filter:EventFilter) : boolean
	{
		if (event.source instanceof EventSource)
		{
			if (filter.source == null) return(true);
			return(filter.source == event.source.source);
		}

		if (filter.field != event.source["field"]) return(false);
		if (filter.block != event.source["block"]) return(false);
	}
}
