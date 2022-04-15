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

import { Form } from "../forms/Form.js";
import { EventType } from "./EventType.js";
import { EventFilter } from "./EventFilter.js";
import { EventListener } from "./EventListener.js";



export class KeyEventSource
{
	constructor(public key:any, public field:string, public block:string, public record:number, public form:Form) {}
}


export class Event
{
	public static newFormEvent(type:EventType, form:Form) : Event
	{
		return(new Event(type,form));
	}

	public static newFieldEvent(type:EventType, form:Form, block?:string, field?:string, record?:number) : Event
	{
		return(new Event(type,form,block,field,record));
	}

	public static newKeyEvent(type:EventType, form:Form, key:any, block?:string, field?:string, record?:number) : Event
	{
		return(new Event(type,form,block,field,record,key));
	}


	private constructor(public type:EventType, public form:Form, public block?:string, public field?:string, public record?:number, public key?:any)
	{
		if (record == null) record = 0;
	}
}


export class Events
{
	private static listeners:EventListener[] = [];

	public static addListener(form:Form, clazz:any, method:Function|string, filter:EventFilter|EventFilter[]) : void
	{
		let listener:EventListener = new EventListener(form,clazz,method,filter);

		if (listener.filters != null)
		{
			for (let i = 0; i < listener.filters.length; i++)
			{
				let filter:EventFilter = listener.filters[i];
				if (filter.field != null) filter.field = filter.field.toLowerCase();
				if (filter.block != null) filter.block = filter.block.toLowerCase();
			}
		}

		Events.listeners.push(listener);
	}

	public static raise(event:Event) : void
	{
		if (event.field != null)
			event.field = event.field.toLowerCase();

		if (event.block != null)
			event.block = event.block.toLowerCase();

		for (let i = 0; i < Events.listeners.length; i++)
		{
			let done:boolean = false;

			for(let f = 0; f < Events.listeners[i].filters.length && !done; f++)
			{
				if (Events.listeners[i].form != null && Events.listeners[i].form != event.form)
					continue;

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

	// Source and Field is interchangeable
	private static match(event:Event, filter:EventFilter) : boolean
	{
		if (filter.field != event.field) return(false);
		if (filter.block != event.block) return(false);
		return(true);
	}
}
