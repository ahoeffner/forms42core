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

export interface Style
{
	style:string;
	value:string;
}


export class HTMLProperties
{
	private row$:number = -1;
	private id$:string = null;
	private name$:string = null;
	private block$:string = null;

	private styles$:Style[] = [];
	private tagname$:string = null;
	private classes$:string[] = [];

	private init$:boolean = true;
	private hidden$:boolean = false;
	private enabled$:boolean = false;
	private readonly$:boolean = false;
	private required$:boolean = false;

	private value$:string = null;
    private values:Map<string,string> = null;
    private valmap:Map<string,string> = null;

	private attrs:Map<string,string> = new Map<string,string>();

	public get id() : string
	{
		return(this.id$);
	}

	public set id(id:string)
	{
		this.id$ = null;

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
		this.name$ = null;

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
		this.block$ = null;

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
		this.tagname$ = tag?.toLowerCase();
	}

	public set value(value:string)
	{
		this.value$ = null;

		if (value != null)
		{
			this.value$ = value.trim();
			if (this.value$.length == 0)
				this.value$ = null;
		}
	}

	public get value() : string
	{
		return(this.value$);
	}

	public get init() : boolean
	{
		let init:boolean = this.init$;
		this.init$ = false;
		return(init);
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

	public getStyles() : Style[]
	{
		return(this.styles$);
	}

	public setStyles(styles:string) : void
	{
		let elements:string[] = styles.split(";")

		for (let i = 0; i < elements.length; i++)
		{
			let element:string = elements[i].trim();

			if (element.length > 0)
			{
				let pos:number = element.indexOf(':');

				if (pos > 0)
				{
					let style:string = element.substring(0,pos).trim();
					let value:string = element.substring(pos+1).trim();

					this.setStyle(style,value);
				}
			}
		}
	}

	public setStyle(style:string, value:string) : void
	{
		value = value.toLowerCase();
		style = style.toLowerCase();

		this.removeStyle(style);
		this.styles$.push({style: style, value: value});
	}

	public removeStyle(style:string) : void
	{
		style = style.toLowerCase();

		for (let i = 0; i < this.styles$.length; i++)
		{
			if (this.styles$[i].style == style)
			{
				delete this.styles$[i];
				break;
			}
		}
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

	public getAttribute(attr:string) : string
	{
		return(this.attrs.get(attr.toLowerCase()));
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

    public getValidValue(key:string) : string
	{
		if (this.valmap == null)
			return(null);

		return(this.valmap.get(key));
    }

    public getValidValues() : Map<string,string>
	{
		return(this.values);
    }

    public setValidValues(values: Set<string> | Map<string,string>) : void
	{
		if (values instanceof Set)
		{
			this.values = new Map<string,string>();
			values.forEach((value) => {this.values.set(value,value)});
		}
        else this.values = values;

		this.valmap = new Map<string,string>();
		this.values.forEach((val,key) => {this.valmap.set(val,key)});
    }

	public apply(tag:HTMLElement) : void
	{
		FieldProperties.apply(tag,this);
	}
}
