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

		this.setError(false);
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

    public setError(flag: boolean) : void
	{
        if (flag) this.setClass("invalid");
        else      this.removeClass("invalid");
    }

    public readonly(flag: boolean) : void
	{
        (this.field.getElement() as HTMLInputElement).readOnly = flag;
    }

	public enabled(flag: boolean) : void
	{
        (this.field.getElement() as HTMLInputElement).disabled = !flag;
    }

    public getStyle() : string
    {
        return(this.field.getElement().style.cssText);
    }

    public setStyle(style: string) : void
    {
		if (style != null)
			this.field.getElement().style.cssText = style;
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