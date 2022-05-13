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

import { Form } from "../../public/Form.js";
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

	public static newFieldEvent(type:EventType, form:Form, block?:string, field?:string) : Event
	{
		return(new Event(type,form,block,field));
	}

	public static newKeyEvent(type:EventType, form:Form, key:any, block?:string, field?:string) : Event
	{
		return(new Event(type,form,block,field,key));
	}


	private constructor(public type:EventType, public form:Form, public block?:string, public field?:string, public key?:any)
	{
	}

	public toString() : string
	{
		let str:string = EventType[this.type];
		if (this.block != null) str += " block: "+this.block;
		if (this.field != null) str += " field: "+this.field;
		if (this.key != null) str += " key: "+this.key;
		return(str);
	}
}


export class Events
{
	private static listeners:EventListener[] = [];
	private static applisteners:Map<EventType,EventListener[]> = new Map<EventType,EventListener[]>();
	private static frmlisteners:Map<EventType,EventListener[]> = new Map<EventType,EventListener[]>();
	private static blklisteners:Map<EventType,EventListener[]> = new Map<EventType,EventListener[]>();
	private static fldlisteners:Map<EventType,EventListener[]> = new Map<EventType,EventListener[]>();

	public static addListener(form:Form, clazz:any, method:Function|string, filter?:EventFilter|EventFilter[]) : object
	{
		let id:object = new Object();
		let listeners:EventListener[] = [];

		if (filter == null)
		{
			listeners.push(new EventListener(id,form,clazz,method,null));
		}
		else if (!Array.isArray(filter))
		{
			listeners.push(new EventListener(id,form,clazz,method,filter as EventFilter));
		}
		else
		{
			filter.forEach((f) => {listeners.push(new EventListener(id,form,clazz,method,f));})
		}

		listeners.forEach((lsnr) =>
		{
			let ltype:number = 0;
			if (lsnr.form != null) ltype = 1;

			if (lsnr.filter != null)
			{
				if (lsnr.filter.field != null) lsnr.filter.field = lsnr.filter.field.toLowerCase();
				if (lsnr.filter.block != null) lsnr.filter.block = lsnr.filter.block.toLowerCase();

				if (lsnr.filter.block != null) ltype = 2;
				if (lsnr.filter.field != null) ltype = 3;

				switch(ltype)
				{
					case 0: Events.add(lsnr.filter.type,lsnr,Events.applisteners); break;
					case 1: Events.add(lsnr.filter.type,lsnr,Events.frmlisteners); break;
					case 2: Events.add(lsnr.filter.type,lsnr,Events.blklisteners); break;
					case 3: Events.add(lsnr.filter.type,lsnr,Events.fldlisteners); break;
				}
			}
			else Events.listeners.push(lsnr);
		});

		return(id);
	}


	public static removeListener(id:object) : void
	{
		let map:Map<EventType,EventListener[]> = null;

		for (let i = 0; i < Events.listeners.length; i++)
		{
			let lsnr:EventListener = Events.listeners[i];

			if (lsnr.id == id)
			{
				delete Events.listeners[i];
				break;
			}
		}

		for (let m = 0; m < 4; m++)
		{
			switch(m)
			{
				case 0: map = Events.fldlisteners; break;
				case 1: map = Events.blklisteners; break;
				case 2: map = Events.frmlisteners; break;
				case 3: map = Events.applisteners; break;
			}

			for(let key of map.keys())
			{
				let listeners:EventListener[] = map.get(key);

				for (let i = 0; listeners != null &&  i < listeners.length; i++)
				{
					if (listeners[i].id == id)
					{
						delete listeners[i];
						map.set(key,listeners);

						if (listeners.length == 0)
							map.delete(key);

						break;
					}
				}
			}
		}
	}


	public static async raise(event:Event) : Promise<boolean>
	{
		let listeners:EventListener[] = null;

		if (event.field != null)
			event.field = event.field.toLowerCase();

		if (event.block != null)
			event.block = event.block.toLowerCase();

		let done:Set<object> = new Set<object>();

		// Field Listeners
		listeners = Events.fldlisteners.get(event.type);
		for (let i = 0; listeners != null && i < listeners.length; i++)
		{
			let lsnr:EventListener = listeners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				done.add(lsnr.id);

				if (!Events.execute(lsnr,event))
					return(false);
			}
		}

		// Block Listeners
		listeners = Events.blklisteners.get(event.type);
		for (let i = 0; listeners != null && i < listeners.length; i++)
		{
			let lsnr:EventListener = listeners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				done.add(lsnr.id);

				if (!Events.execute(lsnr,event))
					return(false);
			}
		}

		// Form Listeners
		listeners = Events.frmlisteners.get(event.type);
		for (let i = 0; listeners != null && i < listeners.length; i++)
		{
			let lsnr:EventListener = listeners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				done.add(lsnr.id);

				if (!Events.execute(lsnr,event))
					return(false);
			}
		}

		// App Listeners
		listeners = Events.applisteners.get(event.type);
		for (let i = 0; listeners != null && i < listeners.length; i++)
		{
			let lsnr:EventListener = listeners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				done.add(lsnr.id);

				if (!Events.execute(lsnr,event))
					return(false);
			}
		}

		for (let i = 0; i < Events.listeners.length; i++)
		{
			let lsnr:EventListener = Events.listeners[i];
			if (!done.has(lsnr))
			{
				done.add(lsnr.id);

				if (!Events.execute(lsnr,event))
					return(false);
			}
		}

		return(true);
	}


	private static async execute(lsnr:EventListener, event:Event) : Promise<boolean>
	{
		let response:boolean = await lsnr.clazz[lsnr.method](event);
		return(response);
	}


	private static match(event:Event, lsnr:EventListener) : boolean
	{
		if (lsnr.form != null && lsnr.form != event.form)
			return(false);

		if (lsnr.filter != null)
		{
			if (lsnr.filter.block != null && lsnr.filter.block != event.block) return(false);
			if (lsnr.filter.field != null && lsnr.filter.field != event.field) return(false);
		}

		return(true);
	}


	private static add(type:EventType, lsnr:EventListener, map:Map<EventType,EventListener[]>) : void
	{
		let listeners:EventListener[] = map.get(type);

		if (listeners == null)
		{
			listeners = [];
			map.set(type,listeners);
		}

		listeners.push(lsnr);
	}
}
