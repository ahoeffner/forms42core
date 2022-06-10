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

import { FieldProperties } from "../FieldProperties.js";
import { FieldContainer } from "../interfaces/FieldContainer.js";
import { FieldImplementation, FieldState } from "../interfaces/FieldImplementation.js";


export class Common
{
	private hidden$:boolean = false;
	private enabled$:boolean = true;
	private readonly$:boolean = true;
	private invalid$:boolean = false;
	private state$:FieldState = null;
    private field:FieldImplementation = null;
	private container$:FieldContainer = null;

    public setImplementation(field:FieldImplementation) : void
    {
        this.field = field;
    }

	// Bypasses validation
	public setStringValue(value:string) : void
    {
        if (value == null) value = "";
		let element:HTMLElement = this.field.getElement();

		if (element instanceof HTMLInputElement)
			element.value = value.trim();

		this.invalid(false);
	}

	// Bypasses object conversion
    public getStringValue() : string
    {
        let str:string = "";
		let element:HTMLElement = this.field.getElement();

		if (element instanceof HTMLInputElement)
			str = element.value.trim();

        return(str);
    }

	public initialize(tag:HTMLElement, container:FieldContainer) : void
	{
		this.container$ = container;
		let props:FieldProperties = container.properties;
		let skip:string[] = ["id","name","type","block","row"];

		props.setType(tag.getAttribute("type"));

		for (let cls of tag.classList.values())
			props.setClass(cls);

		let an:string[] = tag.getAttributeNames();

		an.forEach((name) =>
		{
			if (!skip.includes(name.toLowerCase()))
				props.setAttribute(name,tag.getAttribute(name));
		});
	}

	public getFieldState() : FieldState
	{
		return(this.state$);
	}

	public setFieldState(state:FieldState) : void
	{
		this.state$ = state;
		let enabled:boolean = this.container$.properties.enabled();
		let readonly:boolean = this.container$.properties.readonly();

		switch(state)
		{
			case FieldState.OPEN:
				if (enabled && !this.enabled()) this.enabled(true);
				if (readonly && !this.readonly()) this.readonly(true);
				break;

			case FieldState.READONLY:
				this.readonly(true);
				break;

			case FieldState.DISABLED:
				this.enabled(false);
				break;
			}
	}

    public removeAttribute(attr:string) : void
    {
        this.field.getElement().removeAttribute(attr);
    }

    public setAttribute(attr:string, value:any) : void
    {
		let val:string = "";
		if (value != null) val += value
		this.field.getElement().setAttribute(attr,val);
    }

    public hidden(flag?:boolean) : boolean
	{
		if (flag != null && flag != this.hidden$)
		{
			this.hidden$ = flag;
			if (flag) this.setStyle("display","none");
			else      this.removeStyle("display");
		}

		return(this.hidden$);
    }

    public invalid(flag?:boolean) : boolean
	{
		if (flag != null)
		{
			this.invalid$ = flag;
			if (flag) this.setClass("invalid");
			else      this.removeClass("invalid");
		}

		return(this.invalid$);
    }

    public readonly(flag?:boolean) : boolean
	{
		if (flag != null)
		{
			this.readonly$ = flag;
			(this.field.getElement() as HTMLInputElement).readOnly = flag;
		}
		return(this.readonly$);
    }

	public enabled(flag?:boolean) : boolean
	{
		if (flag != null)
		{
			this.enabled$ = flag;
			(this.field.getElement() as HTMLInputElement).disabled = !flag;
		}
		return(this.enabled$);
    }

    public getStyle(style:string) : string
    {
		style = style.toLowerCase();
		return(this.field.getElement().style.getPropertyValue(style));
    }

    public removeStyle(style:string) : void
    {
		style = style.toLowerCase();
		this.field.getElement().style.removeProperty(style);
    }

    public getStyles() : string[][]
    {
		let parsed:string[][] = [];
		let styles:string[] = this.field.getElement().style.cssText.split(";");

		for (let i = 0; i < styles.length; i++)
		{
			if (styles[i].trim().length > 0)
			{
				let split:number = styles[i].indexOf(":");
				let entry:string = styles[i].substring(0,split).trim();
				let value:string = styles[i].substring(split+1).trim();
				parsed.push([entry.toLowerCase(),value.toLowerCase()]);
			}
		}

		return(parsed);
    }

    public setStyle(style:string, value:string) : void
    {
		style = style.toLowerCase();

		this.removeStyle(style);
		let styles:string[][] = this.getStyles();

		styles.push([style,value]);

		style = "";
		styles.forEach((stl) => {style += stl[0]+": "+stl[1]+";"});
		this.field.getElement().style.cssText = style;
    }

    public setClass(clazz:string) : void
    {
		clazz = clazz.toLowerCase();
		this.field.getElement().classList.add(clazz);
    }

	public hasClass(clazz:string) : boolean
	{
		clazz = clazz.toLowerCase();

		for (let entry of this.field.getElement().classList.entries())
			if (entry[1] == clazz) return(true);

		return(false);
	}

    public removeClass(clazz:string) : void
    {
		clazz = clazz.toLowerCase();
        this.field.getElement().classList.remove(clazz);
    }

    public getClasses() : string[]
    {
		let classes:string[] = [];

		for (let entry of this.field.getElement().classList.entries())
			classes.push(entry[1]);

		return(classes);
    }

	public setClasses(classes:string|string[]) : void
	{
		if (!Array.isArray(classes)) this.field.getElement().classList.value = classes;
		else classes.forEach((clazz) => {this.field.getElement().classList.add(clazz)});
	}
}