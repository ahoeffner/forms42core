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

import { BrowserEvent } from "../../BrowserEvent.js";
import { HTMLProperties } from "../HTMLProperties.js";
import { FieldProperties } from "../../FieldProperties.js";
import { FieldEventHandler } from "../interfaces/FieldEventHandler.js";
import { FieldImplementation, FieldState } from "../interfaces/FieldImplementation.js";

export class Select implements FieldImplementation, EventListenerObject
{
	private state:FieldState = null;
	private properties:HTMLProperties = null;
	private eventhandler:FieldEventHandler = null;

	private element:HTMLInputElement = null;
    private event:BrowserEvent = new BrowserEvent();

	public apply(properties:HTMLProperties) : void
	{
		throw new Error("Method not implemented.");
	}

	public create(container:FieldEventHandler) : HTMLInputElement
	{
		throw new Error("Method not implemented.");
	}

	public getValue() : any
	{
		throw new Error("Method not implemented.");
	}

	public getStringValue() : string
	{
		throw new Error("Method not implemented.");
	}

	public setValue(value:any) : boolean
	{
		throw new Error("Method not implemented.");
	}

	public setStringValue(value:string) : void
	{
		throw new Error("Method not implemented.");
	}

	public getElement() : HTMLElement
	{
		return(this.element);
	}

	public getFieldState() : FieldState
	{
		return(this.state);
	}

	public setFieldState(state:FieldState) : void
	{
		this.state = state;
		let enabled:boolean = this.properties.enabled;
		let readonly:boolean = this.properties.readonly;

		switch(state)
		{
			case FieldState.OPEN:
				if (enabled) FieldProperties.setEnabledState(this.element,this.properties,true);
				if (!readonly) FieldProperties.setReadOnlyState(this.element,this.properties,false);
				break;

			case FieldState.READONLY:
				if (enabled) FieldProperties.setEnabledState(this.element,this.properties,true);
				FieldProperties.setReadOnlyState(this.element,this.properties,true);
				break;

			case FieldState.DISABLED:
				FieldProperties.setEnabledState(this.element,this.properties,false);
				break;
			}
	}

	public handleEvent(object:Event) : void
	{
		throw new Error("Method not implemented.");
	}
}