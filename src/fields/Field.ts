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

import { Class } from "../types/Class.js";
import { FieldTypes } from "./FieldType.js";
import { FieldProperties } from "./FieldProperties.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";

export class Field
{
	private id$:string = null;
	private row$:number = null;
	private name$:string = null;
	private block$:string = null;
	private component$:any = null;
	private element$:HTMLElement = null;
	private impl:FieldImplementation = null;

	constructor(component:any,element:HTMLElement)
	{
		this.component$ = component;
		let type:string = element.getAttribute("type");

		this.id$ = element.getAttribute("id");
		this.row$ = +element.getAttribute("row");
		this.name$ = element.getAttribute("name");

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

		let props:FieldProperties = FieldProperties.get(component,this.block$,this.name$,this.id$);
		props.initialize(element);

		let impl:Class<FieldImplementation> = FieldTypes.get(type);
		this.impl = new impl(this);

		this.element$ = this.impl.getElement();
	}

	public get id() : string
	{
		return(this.id$);
	}

	public get row() : number
	{
		return(this.row$);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get block() : string
	{
		return(this.block$);
	}

	public get component() : any
	{
		return(this.component$);
	}

	public get element() : HTMLElement
	{
		return(this.element$);
	}
}