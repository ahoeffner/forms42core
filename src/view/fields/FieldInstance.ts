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
import { BrowserEvent as Event} from "./BrowserEvent.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";


export class FieldInstance
{
	private form$:Form = null;
	private id$:string = null;
	private row$:number = null;
	private name$:string = null;
	private type$:string = null;
	private field$:Field = null;
	private block$:string = null;
	private element$:HTMLElement = null;
	private impl:FieldImplementation = null;
	private properties$:FieldProperties = null;

	constructor(form:Form,element:HTMLElement)
	{
		this.form$ = form;

		let row:string = element.getAttribute("row");

		if (row == null) row = "-1";
		else if (isNaN(+row)) throw "@FieldInstance: row: '"+row+"' is not a number";

		this.row$ = +row;

		this.id$ = element.getAttribute("id");
		this.name$ = element.getAttribute("name");
		this.type$ = element.getAttribute("type");
		this.block$ = element.getAttribute("block");

		if (this.id$ == null)
			this.id$ = "";

		if (this.name$ == null)
			this.name$ = "";

		if (this.type$ == null)
			this.type$ = "text";

		if (this.block$ == null)
			this.block$ = "";

		if (this.row$ == null || this.row$ < 0)
			this.row$ = -1;

		this.id$ = this.id$.toLowerCase();
		this.name$ = this.name$.toLowerCase();
		this.type$ = this.type$.toLowerCase();
		this.block$ = this.block$.toLowerCase();
		this.properties$ = new FieldProperties(element);
		this.field$ = Field.create(form,this.block$,this.row$,this.name$);

		let clazz:Class<FieldImplementation> = FieldTypes.get(this.type$);

		this.impl = new clazz();
		this.impl.initialize(this);
		this.element$ = this.impl.getElement();

		this.field$.add(this);
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

	public get type() : string
	{
		return(this.type$);
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

	public setValue(value:any) : boolean
	{
		return(this.impl.setValue(value));
	}

	public validate() : boolean
	{
		return(this.impl.validate());
	}

	public handleEvent(event:Event) : void
	{
		this.field.handleEvent(this,event);
	}
}