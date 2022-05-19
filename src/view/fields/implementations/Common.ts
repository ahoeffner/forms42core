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

import { FieldImplementation } from "../interfaces/FieldImplementation.js";


export class Common
{
	private hidden$:boolean = false;
	private invalid$:boolean = false;
	private enabled$:boolean = false;
	private readonly$:boolean = false;
    private field:FieldImplementation = null;

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

    public removeAttribute(attr:string) : void
    {
        this.field.getElement().removeAttribute(attr);
    }

    public setAttribute(attr:string, value:string) : void
    {
        this.field.getElement().setAttribute(attr,value);
    }

    public hidden(flag?:boolean) : boolean
	{
		if (flag != null)
		{
			this.hidden$ = flag;
			if (flag) this.setStyle("display","none");
			else      this.setStyle("display","inline-block");
		}

		return(this.invalid$);
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

	public enabled(flag:boolean) : boolean
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
		let styles:string[][] = this.getStyles();

		for (let i = 0; i < styles.length; i++)
		{
			if (styles[i][0] == style)
				return(styles[i][1]);
		}

		return(null);
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
				parsed.push([entry,value]);
			}
		}

		return(parsed);
    }

    public setStyle(style:string, value:string) : string
    {
		let styles:string[][] = this.getStyles();
		return(this.field.getElement().style.cssText);
    }

    public setClass(clazz:string) : void
    {
		if (clazz != null)
			this.field.getElement().classList.add(clazz);
    }

    public removeClass(clazz:string) : void
    {
        this.field.getElement().classList.remove(clazz);
    }

    public getClasses() : string
    {
        return(this.field.getElement().classList.value);
    }

    public setClasses(classes: string) : void
    {
		if (classes != null)
			this.field.getElement().classList.value = classes;
    }
}