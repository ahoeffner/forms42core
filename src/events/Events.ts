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
	private static applisteners:EventListener[] = [];
	private static frmlisteners:EventListener[] = [];
	private static blklisteners:EventListener[] = [];
	private static fldlisteners:EventListener[] = [];

	public static addListener(form:Form, clazz:any, method:Function|string, filter:EventFilter|EventFilter[]) : object
	{
		let id:object = new Object();
		let listeners:EventListener[] = [];

		if (filter == null)
		{
			listeners.push(new EventListener(id,form,clazz,method,filter as EventFilter));
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
			let type:number = 0;
			if (lsnr.form != null) type = 1;

			if (lsnr.filter != null)
			{
				if (lsnr.filter.field != null) lsnr.filter.field = lsnr.filter.field.toLowerCase();
				if (lsnr.filter.block != null) lsnr.filter.block = lsnr.filter.block.toLowerCase();

				if (lsnr.filter.block != null) type = 2;
				if (lsnr.filter.field != null) type = 3;
			}

			switch(type)
			{
				case 0: Events.applisteners.push(lsnr); break;
				case 1: Events.frmlisteners.push(lsnr); break;
				case 2: Events.blklisteners.push(lsnr); break;
				case 3: Events.fldlisteners.push(lsnr); break;
			}
		});

		return(id);
	}


	public static async raise(event:Event) : Promise<boolean>
	{
		let retval:boolean = true;

		if (event.field != null)
			event.field = event.field.toLowerCase();

		if (event.block != null)
			event.block = event.block.toLowerCase();

		let done:Set<object> = new Set<object>();

		// Field Listeners
		for (let i = 0; i < Events.fldlisteners.length; i++)
		{
			let lsnr:EventListener = Events.fldlisteners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				console.log("field match");
				done.add(lsnr.id);
			}
		}

		// Block Listeners
		for (let i = 0; i < Events.blklisteners.length; i++)
		{
			let lsnr:EventListener = Events.blklisteners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				console.log("block match");
				done.add(lsnr.id);
			}
		}

		// Form Listeners
		for (let i = 0; i < Events.frmlisteners.length; i++)
		{
			let lsnr:EventListener = Events.frmlisteners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				console.log("form match");
				done.add(lsnr.id);
			}
		}

		// App Listeners
		for (let i = 0; i < Events.applisteners.length; i++)
		{
			let lsnr:EventListener = Events.applisteners[i];

			if (done.has(lsnr.id))
				continue;

			if (Events.match(event,lsnr))
			{
				console.log("app match");
				done.add(lsnr.id);
			}
		}

		return(retval);
	}

	// Source and Field is interchangeable
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
}
