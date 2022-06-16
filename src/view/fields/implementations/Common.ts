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
	private enabled$:boolean = true;
	private readonly$:boolean = true;
	private state$:FieldState = null;
    private field:FieldImplementation = null;
	private properties$:HTMLProperties = null;

	public setProperties(properties:HTMLProperties) : void
	{
		this.properties$ = properties;
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
		let enabled:boolean = this.properties$.enabled;
		let readonly:boolean = this.properties$.readonly;

		switch(state)
		{
			case FieldState.OPEN:
				console.log("open "+this.properties$.name+"["+this.properties$.row+"]")
				if (enabled) this.enabled(true);
				if (!readonly) this.readonly(false);
				break;

			case FieldState.READONLY:
				console.log("readonly "+this.properties$.name+"["+this.properties$.row+"]")
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
}