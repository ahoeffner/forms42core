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

import { Field } from "./Field.js";
import { Form } from "../../public/Form.js";
import { FieldTypes } from "./FieldType.js";
import { Class } from "../../types/Class.js";
import { HTMLProperties } from "./HTMLProperties.js";
import { FieldProperties } from "../FieldProperties.js";
import { BrowserEvent as Event} from "../BrowserEvent.js";
import { FieldEventHandler } from "./interfaces/FieldEventHandler.js";
import { FieldImplementation, FieldState } from "./interfaces/FieldImplementation.js";


export class FieldInstance implements FieldEventHandler
{
	private form$:Form = null;
	private field$:Field = null;
	private element$:HTMLElement = null;
	private impl:FieldImplementation = null;
	private properties$:HTMLProperties = null;

	constructor(form:Form,tag:HTMLElement)
	{
		this.form$ = form;
		this.properties$ = FieldProperties.consume(tag);
		this.field$ = Field.create(form,this.properties$.block,this.properties$.name,this.properties$.row);

		let clazz:Class<FieldImplementation> = FieldTypes.get(tag.tagName,this.properties$.getAttribute("type"));
		this.impl = new clazz();

		this.impl.create(this);
		this.element$ = this.impl.getElement();

		this.field$.addInstance(this);
	}

	public get row() : number
	{
		return(this.properties$.row);
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get name() : string
	{
		return(this.properties$.name);
	}

	public get block() : string
	{
		return(this.properties.block);
	}

	public get field() : Field
	{
		return(this.field$);
	}

	public set valid(flag:boolean)
	{
		if (!flag) this.element.classList.add("invalid");
		else       this.element.classList.remove("invalid");

	}

	public get properties() : HTMLProperties
	{
		return(this.properties$);
	}

	public get element() : HTMLElement
	{
		return(this.element$);
	}

	public getValue() : any
	{
		return(this.impl.getValue());
	}

	public getStringValue() : string
	{
		return(this.impl.getStringValue());
	}

	public setStringValue(value:string) : void
	{
		this.valid = true;
		this.field.valid = true;
		this.impl.setStringValue(value);
	}

	public setValue(value:any) : boolean
	{
		return(this.impl.setValue(value));
	}

	public blur() : void
	{
		this.impl.getElement().blur();
	}

	public focus() : void
	{
		this.impl.getElement().focus();
	}

	public setFieldState(state:FieldState) : void
	{
		this.impl.setFieldState(state);
	}

	public initialize() : void
	{
		this.impl.apply(this.properties$);
	}

	public setInstanceType(type:string) : void
	{
		let element:HTMLElement = this.element;
		let clazz:Class<FieldImplementation> = FieldTypes.get(type);

		this.impl = new clazz();
		//this.impl.initialize(this.element$,this);

		this.element$ = this.impl.getElement();
		this.field.reindexInstance(element,this);
	}

	public handleEvent(event:Event) : void
	{
		this.field.handleEvent(this,event);
	}

	public toString() : string
	{
		return(this.name+"["+this.row+"]");
	}
}