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
	private classes:string[] = [];
	private styles:string[][] = [];
	private hidden$:boolean = false;
	private enabled$:boolean = false;
	private readonly$:boolean = false;
    private values: Set<any> | Map<any, any> = null;
	private attrs:Map<string,string> = new Map<string,string>();

	public getType() : string
	{
		return(this.type);
	}

	public setType(type:string) : void
	{
		if (type == null) type = "text";
		this.type = type.toLowerCase();
	}

	public enabled(flag?:boolean) : boolean
	{
		if (flag != null) this.enabled$ = flag;
		return(this.enabled$);
	}

	public readonly(flag?:boolean) : boolean
	{
		if (flag != null) this.readonly$ = flag;
		return(this.readonly$);
	}

	public hidden(flag?:boolean) : boolean
	{
		if (flag != null) this.hidden$ = flag;
		return(this.hidden$);
	}

	public getStyles() : string[][]
	{
		return(this.styles);
	}

	public setStyle(style:string, value:string) : void
	{
		value = value.toLowerCase();
		style = style.toLowerCase();

		this.removeStyle(style);
		let styles:string[][] = this.getStyles();
		styles.push([style,value]);
	}

	public removeStyle(style:any) : void
	{
		style = style.toLowerCase();
		delete this.styles[this.styles.indexOf(style)];
	}

	public setClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();

		if (this.classes[clazz] == null)
			this.classes.push(clazz);
	}

	public getClasses() : string[]
	{
		return(this.classes);
	}

	public hasClass(clazz:string) : boolean
	{
		clazz = clazz.toLowerCase();
		return(this.classes.includes(clazz));
	}

	public removeClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();
		delete this.classes[this.classes.indexOf(clazz)];
	}

	public setClasses(classes:string|string[]) : void
	{
		this.classes = [];

		if (!Array.isArray(classes))
			classes = classes.split(" ,;");

		for(let clazz in classes)
		{
			if (clazz.length > 0)
				this.classes.push(clazz.toLowerCase());
		}
	}

	public getAttributes() : Map<string,string>
	{
		return(this.attrs);
	}

	public setAttribute(attr:string, value:string) : void
	{
		attr = attr.toLowerCase();
		this.attrs.set(attr,value);
	}

	public removeAttribute(attr:string) : void
	{
		attr = attr.toLowerCase();
		this.attrs.delete(attr.toLowerCase());
	}

    public getValidValues() : Set<any> | Map<any,any>
	{
		return(this.values);
    }

    public setValidValues(values: Set<any> | Map<any,any>) : void
	{
        this.values = values;
    }
}
