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

export class Radio implements FieldImplementation, EventListenerObject
{
	private state:FieldState = null;
	private properties:HTMLProperties = null;
	private eventhandler:FieldEventHandler = null;

	private element:HTMLSelectElement = null;
    private event:BrowserEvent = new BrowserEvent();

	public create(eventhandler:FieldEventHandler) : HTMLSelectElement
	{
		this.element = document.createElement("select");
		this.eventhandler = eventhandler;
		return(this.element);
	}

	public apply(properties:HTMLProperties) : void
	{
		this.properties = properties;
		properties.apply(this.element);
		this.setAttributes(properties.getAttributes());
		if (properties.init) this.addEvents(this.element);
	}

	public getValue() : any
	{
		throw new Error("Method not implemented.");
	}

	public setValue(value:any) : boolean
	{
		throw new Error("Method not implemented.");
	}

	public getStringValue() : string
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

	public setAttributes(attributes:Map<string,string>) : void
	{
        attributes.forEach((value,attr) =>
        {this.element.setAttribute(attr,value);});
	}

	public handleEvent(event:Event) : void
	{
		this.event.setEvent(event);
		this.eventhandler.handleEvent(this.event);
	}

    private addEvents(element:HTMLElement) : void
    {
        element.addEventListener("blur",this);
        element.addEventListener("focus",this);
        element.addEventListener("change",this);

        element.addEventListener("keyup",this);
        element.addEventListener("keydown",this);
        element.addEventListener("keypress",this);

        element.addEventListener("wheel",this);
        element.addEventListener("mouseup",this);
        element.addEventListener("mouseout",this);
        element.addEventListener("mousedown",this);
        element.addEventListener("mouseover",this);
        element.addEventListener("mousemove",this);

        element.addEventListener("drop",this);
        element.addEventListener("dragover",this);

        element.addEventListener("click",this);
        element.addEventListener("dblclick",this);
    }
}