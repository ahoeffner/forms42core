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

import { DataType } from "./DataType.js";
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

	private value$:string = null;
	private checked:string = null;
	private element:HTMLInputElement = null;
	private datatype:DataType = DataType.string;
    private event:BrowserEvent = new BrowserEvent();

	public create(eventhandler:FieldEventHandler, _tag:string) : HTMLInputElement
	{
		this.element = document.createElement("input");
		this.eventhandler = eventhandler;
		return(this.element);
	}

	public apply(properties:HTMLProperties) : void
	{
		this.properties = properties;
		properties.apply(this.element);
		this.checked = properties.value;
		this.setAttributes(properties.getAttributes());
		if (properties.init) this.addEvents(this.element);
	}

	public getValue() : any
	{
		if (this.datatype == DataType.integer)
			return(+this.value$);

		if (this.datatype == DataType.decimal)
			return(+this.value$);

		return(this.value$);
	}

	public setValue(value:any) : boolean
	{
		this.value$ = value;
		let comp:string = "";
		if (value != null) comp = value+"";
		this.element.checked = (comp == this.checked);
		return(true);
	}

	public getStringValue() : string
	{
		return(this.getValue());
	}

	public setStringValue(value:string) : void
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


	public setAttributes(attributes:Map<string,string>) : void
	{
        attributes.forEach((value,attr) =>
        {
			if (attr.toLowerCase() == "date")
				this.datatype = DataType.date;

			if (attr.toLowerCase() == "datetime")
				this.datatype = DataType.datetime;

			if (attr.toLowerCase() == "integer")
				this.datatype = DataType.integer;

			if (attr.toLowerCase() == "decimal")
				this.datatype = DataType.decimal;

				this.element.setAttribute(attr,value);
		});
	}

	public handleEvent(event:Event) : void
	{
        let buble:boolean = false;
		this.event.setEvent(event);

		if (this.event.type == "focus")
			buble = true;

		if (this.event.type == "blur")
			buble = true;

		if (this.event.type == "change")
		{
			buble = true;
			this.value$ = this.element.value;

			if (!this.element.checked)
				this.value$ = null;
		}

		if (this.event.accept || this.event.cancel)
			buble = true;

		if (this.event.type.startsWith("mouse"))
			buble = true;

		if (this.event.onScrollUp)
			buble = true;

        if (this.event.onScrollDown)
			buble = true;

        if (this.event.onCtrlKeyDown)
			buble = true;

        if (this.event.onFuncKey)
			buble = true;

		this.event.preventDefault();

		if (buble)
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