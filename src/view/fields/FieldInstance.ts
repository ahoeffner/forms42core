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
import { FieldContainer } from "./interfaces/FieldContainer.js";
import { FieldImplementation, FieldState } from "./interfaces/FieldImplementation.js";


export class FieldInstance implements FieldContainer
{
	private form$:Form = null;
	private id$:string = null;
	private row$:number = null;
	private name$:string = null;
	private field$:Field = null;
	private block$:string = null;
	private element$:HTMLElement = null;
	private impl:FieldImplementation = null;
	private properties$:HTMLProperties = null;

	constructor(form:Form,tag:HTMLElement)
	{
		this.form$ = form;
		this.properties$ = FieldProperties.consume(tag);

		this.id$ = this.properties$.id;
		this.row$ = this.properties$.row;
		this.name$ = this.properties$.name;
		this.block$ = this.properties$.block;

		this.field$ = Field.create(form,this.block$,this.name$,this.row$);

		let clazz:Class<FieldImplementation> = FieldTypes.get(tag.tagName);

		this.impl = new clazz();

		this.impl.create(this);
		this.impl.apply(this.properties$);

		this.element$ = this.impl.getElement();
		this.field$.addInstance(this);
	}

	public get id() : string
	{
		return(this.id$);
	}

	public get row() : number
	{
		return(this.row$);
	}

	public set row(row:number)
	{
		this.row$ = row;
	}

	public get form() : Form
	{
		return(this.form$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get block() : string
	{
		return(this.block$);
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

	public setRownum() : void
	{
		if (this.row$ >= 0)
		{
			this.impl.getElement().setAttribute("row",""+this.row$);
			this.properties.setAttribute("row",this.row$);
		}
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