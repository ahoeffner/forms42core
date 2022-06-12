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
import { FieldProperties } from "./FieldProperties.js";
import { BrowserEvent as Event} from "../BrowserEvent.js";
import { FieldContainer } from "./interfaces/FieldContainer.js";
import { FieldProperties as Override } from "../../public/FieldProperties.js";
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
	private properties$:FieldProperties = null;

	constructor(form:Form,block:string,tag:HTMLElement)
	{
		this.form$ = form;

		let row:string = tag.getAttribute("row");

		if (row == null) row = "-1";
		else if (isNaN(+row)) throw "@FieldInstance: row: '"+row+"' is not a number";

		this.row$ = +row;
		this.block$ = block;

		this.id$ = tag.getAttribute("id");
		this.name$ = tag.getAttribute("name");

		if (this.id$ == null)
			this.id$ = "";

		if (this.name$ == null)
			this.name$ = "";

		if (this.block$ == null)
			this.block$ = "";

		if (this.row$ == null || this.row$ < 0)
			this.row$ = -1;

		this.id$ = this.id$.toLowerCase();
		this.name$ = this.name$.toLowerCase();
		this.block$ = this.block$.toLowerCase();
		this.properties$ = new FieldProperties();
		this.field$ = Field.create(form,this.block$,this.row$,this.name$);

		let clazz:Class<FieldImplementation> = FieldTypes.get(this.properties$.getType());

		this.impl = new clazz();
		this.impl.initialize(tag,this);
		this.element$ = this.impl.getElement();

		if (this.id$.length > 0) this.element$.setAttribute("id",this.id$);
		if (this.name$.length > 0) this.element$.setAttribute("name",this.name$);
		if (this.block$.length > 0) this.element$.setAttribute("block",this.block$);

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

	public get properties() : FieldProperties
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

	public invalid(flag?:boolean) : boolean
	{
		return(this.impl.invalid(flag));
	}

	public setRownum() : void
	{
		if (this.row$ >= 0)
		{
			this.impl.setAttribute("row",this.row$);
			this.properties.setAttribute("row",this.row$);
		}
	}

	public setDefaults(override:Override) : void
	{
		this.impl.setDefaults();
	}

	public getStyle(style?:string) : string|string[][]
	{
		return(this.impl.getStyle(style));
	}

	public setStyle(style:string, value:string) : void
	{
		this.impl.setStyle(style,value);
	}

	public setInstanceType(type:string) : void
	{
		let element:HTMLElement = this.element;
		let clazz:Class<FieldImplementation> = FieldTypes.get(type);

		this.impl = new clazz();
		this.impl.initialize(this.element$,this);

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