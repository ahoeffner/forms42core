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

import { FormEvents } from "./FormEvents.js";
import { EventFilter } from "./EventFilter.js";
import { FormMetaData } from "../../application/FormMetaData.js";
import { TriggerFunction } from "../../public/TriggerFunction.js";

export class EventListenerClass
{
	protected constructor()
	{
		FormMetaData.getListenerEvents(this).forEach((event) =>
		{this.addEventListener(this[event.method],event.filter);});
	}

	public removeEventListener(handle:object) : void
	{
		FormEvents.removeListener(handle);
	}

	public addEventListener(method:TriggerFunction, filter?:EventFilter|EventFilter[]) : object
	{
		return(FormEvents.addListener(null,this,method,filter));
	}
}