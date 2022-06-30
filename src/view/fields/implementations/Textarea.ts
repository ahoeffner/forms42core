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
import { DataConverter, Tier } from "../DataConverter.js";
import { FieldProperties } from "../../FieldProperties.js";
import { FieldEventHandler } from "../interfaces/FieldEventHandler.js";
import { FieldImplementation, FieldState } from "../interfaces/FieldImplementation.js";

export class Textarea implements FieldImplementation, EventListenerObject
{
	private state:FieldState = null;
	private properties:HTMLProperties = null;
	private dataconverter:DataConverter = null;
	private eventhandler:FieldEventHandler = null;

	private element:HTMLTextAreaElement = null;
    private event:BrowserEvent = BrowserEvent.get();

	public create(eventhandler:FieldEventHandler, _tag:string) : HTMLElement
	{
		this.element = document.createElement("textarea");
		this.eventhandler = eventhandler;
		return(this.element);
	}

	public apply(properties:HTMLProperties) : void
	{
		this.properties = properties;
		properties.apply(this.element);
		if (properties.init) this.addEvents(this.element);
	}

	public getValue() : any
	{
		let value = this.element.value;

		if (this.dataconverter != null)
		{
			value = this.dataconverter.getValue(Tier.Backend);
			if (value == null) this.element.value = "";
			return(value);
		}

		return(value);
	}

	public setValue(value:any) : boolean
	{
		if (this.dataconverter != null)
		{
			this.dataconverter.setValue(Tier.Backend,value);
			value = this.dataconverter.getValue(Tier.Frontend);
		}

		this.element.value = value;
		return(true);
	}

	public getIntermediateValue() : string
	{
		return(this.getValue());
	}

	public setIntermediateValue(value:string) : void
	{
		this.setValue(value);
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

	public async handleEvent(event:Event) : Promise<void>
	{
        let bubble:boolean = false;
		this.event.setEvent(event);

		if (this.event.type == "focus")
			bubble = true;

		if (this.event.type == "blur")
			bubble = true;

		if (this.event.type == "change")
			bubble = true;

		if (this.event.accept || this.event.cancel)
			bubble = true;

		if (this.event.bubbleMouseEvent)
			bubble = true;

		if (this.event.onScrollUp)
			bubble = true;

        if (this.event.onScrollDown)
			bubble = true;

        if (this.event.onCtrlKeyDown)
			bubble = true;

        if (this.event.onFuncKey)
			bubble = true;

		this.event.preventDefault();

		if (bubble)
			await this.eventhandler.handleEvent(this.event);
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
        element.addEventListener("contextmenu",this);
    }
}