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


export class HTMLProperties
{
	private row$:number = -1;
	private id$:string = null;
	private name$:string = null;
	private block$:string = null;

	private tagname$:string = null;
	private subtype$:string = null;
	private classes$:string[] = [];
	private styles$:string[][] = [];

	private init$:boolean = true;
	private hidden$:boolean = false;
	private enabled$:boolean = false;
	private readonly$:boolean = false;
	private required$:boolean = false;

    private values: Set<any> | Map<any, any> = null;
	private attrs:Map<string,string> = new Map<string,string>();

	public get id() : string
	{
		return(this.id$);
	}

	public set id(id:string)
	{
		if (id != null)
		{
			this.id$ = id.trim().toLowerCase();
			if (this.id$.length == 0) this.id$ = null;
		}
	}

	public get name() : string
	{
		return(this.name$);
	}

	public set name(name:string)
	{
		if (name != null)
		{
			this.name$ = name.trim().toLowerCase();
			if (this.name$.length == 0) this.name$ = null;
		}
	}

	public get block() : string
	{
		return(this.block$);
	}

	public set block(block:string)
	{
		if (block != null)
		{
			this.block$ = block.trim().toLowerCase();
			if (this.block$.length == 0) this.block$ = null;
		}
	}

	public get row() : number
	{
		return(this.row$);
	}

	public set row(row:number)
	{
		if (row < 0) this.row$ = -1;
		else		 this.row$ = row;
	}

	public get tag() : string
	{
		return(this.tagname$);
	}

	public set tag(tag:string)
	{
		this.tagname$ = tag.toLowerCase();
	}

	public get subtype() : string
	{
		return(this.subtype$);
	}

	public set subtype(type:string)
	{
		if (type == null) this.subtype$ = "text";
		else this.subtype$ = type.trim().toLowerCase();
	}

	public get init() : boolean
	{
		return(this.init$);
	}

	public set init(flag:boolean)
	{
		this.init$ = flag;
	}

	public get enabled() : boolean
	{
		return(this.enabled$);
	}

	public set enabled(flag:boolean)
	{
		this.enabled$ = flag;
	}

	public get readonly() : boolean
	{
		return(this.readonly$);
	}

	public set readonly(flag:boolean)
	{
		this.readonly$ = flag;
	}

	public get required() : boolean
	{
		return(this.required$);
	}

	public set required(flag:boolean)
	{
		this.required$ = flag;
	}

	public get hidden() : boolean
	{
		return(this.hidden$);
	}

	public set hidden(flag:boolean)
	{
		this.hidden$ = flag;
	}

	public getStyles() : string[][]
	{
		return(this.styles$);
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
		delete this.styles$[this.styles$.indexOf(style)];
	}

	public setClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();

		if (this.classes$[clazz] == null)
			this.classes$.push(clazz);
	}

	public getClasses() : string[]
	{
		return(this.classes$);
	}

	public hasClass(clazz:string) : boolean
	{
		clazz = clazz.toLowerCase();
		return(this.classes$.includes(clazz));
	}

	public removeClass(clazz:any) : void
	{
		clazz = clazz.toLowerCase();
		delete this.classes$[this.classes$.indexOf(clazz)];
	}

	public setClasses(classes:string|string[]) : void
	{
		this.classes$ = [];

		if (!Array.isArray(classes))
			classes = classes.split(" ,;");

		for(let clazz in classes)
		{
			if (clazz.length > 0)
				this.classes$.push(clazz.toLowerCase());
		}
	}

	public getAttributes() : Map<string,string>
	{
		return(this.attrs);
	}

	public setAttribute(attr:string, value:any) : void
	{
		let val:string = "";
		attr = attr.toLowerCase();

		if (value != null)
			val += value;

		this.attrs.set(attr,val);
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

	public apply(tag:HTMLElement) : void
	{
		FieldProperties.apply(tag,this);
	}
}
