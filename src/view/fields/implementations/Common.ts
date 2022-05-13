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
    private properties:any = {};
	private body:HTMLElement = null;
    private field:FieldImplementation = null;
    private attributes: Map<string, string> = null;
    private values: Set<any> | Map<any, any> = null;

    public setImplementation(field:FieldImplementation) : void
    {
        this.field = field;
    }

    public getBody() : HTMLElement
    {
        return(this.body);
    }

    public setBody(body: HTMLElement) : void
    {
        this.body = body;
    }

    public getProperties() : any
	{
        return(this.properties);
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

    public setProperties(properties: any) : void
	{
        this.properties = properties;
    }

    public removeAttribute(attr:string) : void
    {
        this.field.getElement().removeAttribute(attr);
    }

    public setAttribute(attr:string, value:string) : void
    {
        this.field.getElement().setAttribute(attr,value);
    }

    public getAttributes(): Map<string, any>
    {
        return(this.attributes);
    }

    public setAttributes(attributes: Map<string, any>): void
    {
		let id:string = this.field.getFieldInstance().id;
		let name:string = this.field.getFieldInstance().name;
		let block:string = this.field.getFieldInstance().block;

		if (id.length > 0) this.setAttribute("id",id);
		if (name.length > 0) this.setAttribute("name",name);
		if (block.length > 0) this.setAttribute("block",block);

		this.attributes = attributes;
    }

    public getValidValues() : Set<any> | Map<any, any>
	{
        return(this.values);
    }

    public setValidValues(values: Set<any> | Map<any, any>) : void
	{
        this.values = values;
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