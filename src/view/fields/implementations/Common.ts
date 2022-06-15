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

import { HTMLProperties } from "../HTMLProperties.js";
import { FieldImplementation, FieldState } from "../interfaces/FieldImplementation.js";


export class Common
{
	private hidden$:boolean = false;
	private enabled$:boolean = true;
	private readonly$:boolean = true;
	private state$:FieldState = null;
    private field:FieldImplementation = null;
	private properties:HTMLProperties = null;

	public setProperties(properties:HTMLProperties) : void
	{
		this.properties = properties;
	}

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

	public getFieldState() : FieldState
	{
		return(this.state$);
	}

	public setFieldState(state:FieldState) : void
	{
		this.state$ = state;
		let enabled:boolean = this.properties.enabled;
		let readonly:boolean = this.properties.readonly;

		switch(state)
		{
			case FieldState.OPEN:
				if (enabled && !this.enabled()) this.enabled(true);
				if (!readonly && this.readonly()) this.readonly(false);
				break;

			case FieldState.READONLY:
				if (enabled) this.enabled(true);
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