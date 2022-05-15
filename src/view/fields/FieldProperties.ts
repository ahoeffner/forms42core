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


export class FieldProperties
{
	private type:string = null;
	private styles:string[] = [];
	private classes:string[] = [];
    private values: Set<any> | Map<any, any> = null;
	private attrs:Map<string,string> = new Map<string,string>();

	constructor(element:HTMLElement)
	{
		let skip:string[] = ["id","name","type","block","row"];

		this.type = element.getAttribute("type");

		if (this.type == null)
			this.type = "text";

		this.type = this.type.toLowerCase();

		for (let cls of element.classList.values())
			this.classes.push(cls);

		let an:string[] = element.getAttributeNames();
		an.forEach((name) =>
		{
			if (!skip.includes(name.toLowerCase()))
				this.attrs.set(name,element.getAttribute(name));
		});
	}

	public getType() : string
	{
		return(this.type);
	}

	public setType(type:string) : void
	{
		this.type = type;
	}

	public setStyle(style:any) : void
	{
		style = style.toLowerCase();

		if (this.styles[style] == null)
			this.styles.push(style);
	}

	public removeStyle(style:any) : void
	{
		style = style.toLowerCase();
		delete this.styles[style];
	}

	public setClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();

		if (this.classes[clazz] == null)
			this.classes.push(clazz);
	}

	public removeClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();
		delete this.classes[clazz];
	}

	public setAttribute(attr:string, value:string) : void
	{
		this.attrs.set(attr.toLowerCase(),value);
	}

	public removeAttribute(attr:string) : void
	{
		this.attrs.delete(attr.toLowerCase());
	}

	public getStyles() : string
	{
		if (this.styles.length == 0)
			return(null);

		let styles:string = "";

		for(let i = 0; i < this.styles.length; i++)
			styles += this.styles[i]+";";

		return(styles);
	}

	public getClasses() : string
	{
		if (this.classes.length == 0)
			return(null);

		let classes:string = null;
		for(let i = 0; i < this.classes.length; i++)
		{
			if (classes == null) classes = "";
			else 				 classes += ",";

			classes += this.classes[i];
		}

		return(classes);
	}

	public getAttributes() : Map<string,string>
	{
		return(this.attrs);
	}

    public getValidValues() : Set<any> | Map<any,any>
	{
		return(this.values);
    }

    public setValidValues(values: Set<any> | Map<any,any>) : void
	{
        this.values = values;
    }

	public hasClass(clazz:string) : boolean
	{
		return(this.classes.includes(clazz));
	}
}
