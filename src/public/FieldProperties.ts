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

import { Form } from './Form.js';
import { FieldInstance } from '../view/fields/FieldInstance.js';
import { FieldFeatureFactory } from '../view/FieldFeatureFactory.js';

export interface Style
{
	style:string;
	value:string;
}

export class FieldProperties
{
	private default$:boolean = true;
	private inst$:FieldInstance = null;

	private tag$:string = null;
	private styles$:Style[] = [];
	private classes$:string[] = [];
	private attribss$:Map<string,string> = new Map<string,string>();

	private hidden$:boolean = false;
	private enabled$:boolean = false;
	private readonly$:boolean = false;
	private required$:boolean = false;

	private value$:string = null;
    private values$:Map<string,string> = null;

	private fixed$:string[] = ["id","name","block","row","invalid"];
	private structured$:string[] = ["hidden","enabled","readonly","required","value","class","style"];


	constructor(inst$:FieldInstance, default$:boolean)
	{
		this.inst$ = inst$;
		this.default$ = default$;
	}

	public get name() : string
	{
		return(this.inst$.name);
	}

	public get block() : string
	{
		return(this.inst$.block);
	}

	public get row() : number
	{
		if (this.inst$.row < 0) return(null);
		else 					return(this.inst$.row);
	}

	public get form() : Form
	{
		return(this.inst$.form);
	}

	public get tag() : string
	{
		return(this.tag$);
	}

	public set tag(tag:string)
	{
		this.tag$ = tag?.toLowerCase();
	}

	public setTag(tag:string) : FieldProperties
	{
		this.tag = tag;
		return(this);
	}

	public get enabled() : boolean
	{
		return(this.enabled$);
	}

	public set enabled(flag:boolean)
	{
		this.enabled$ = flag;
	}

	public setEnabled(flag:boolean) : FieldProperties
	{
		this.enabled = flag;
		return(this);
	}

	public get readonly() : boolean
	{
		return(this.readonly$);
	}

	public set readonly(flag:boolean)
	{
		this.readonly$ = flag;
	}

	public setReadOnly(flag:boolean) : FieldProperties
	{
		this.readonly = flag;
		return(this);
	}

	public get required() : boolean
	{
		return(this.required$);
	}

	public set required(flag:boolean)
	{
		this.required$ = flag;
	}

	public setRequired(flag:boolean) : FieldProperties
	{
		this.required = flag;
		return(this);
	}

	public get hidden() : boolean
	{
		return(this.hidden$);
	}

	public set hidden(flag:boolean)
	{
		this.hidden$ = flag;
	}

	public setHidden(flag:boolean) : FieldProperties
	{
		this.hidden = flag;
		return(this);
	}

	public getStyles() : Style[]
	{
		return(this.styles$);
	}

	public setStyles(styles:string) : FieldProperties
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

		return(this);
	}

	public setStyle(style:string, value:string) : FieldProperties
	{
		value = value.toLowerCase();
		style = style.toLowerCase();

		this.removeStyle(style);
		this.styles$.push({style: style, value: value});

		return(this);
	}

	public removeStyle(style:string) : FieldProperties
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

		return(this);
	}

	public setClass(clazz:any) : FieldProperties
	{
		clazz = clazz.toLowerCase();

		if (this.classes$[clazz] == null)
			this.classes$.push(clazz);

		return(this);
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

	public removeClass(clazz:any) : FieldProperties
	{
		clazz = clazz.toLowerCase();
		delete this.classes$[this.classes$.indexOf(clazz)];
		return(this);
	}

	public setClasses(classes:string|string[]) : FieldProperties
	{
		this.classes$ = [];

		if (!Array.isArray(classes))
			classes = classes.split(" ,;");

		for(let clazz in classes)
		{
			if (clazz.length > 0)
				this.classes$.push(clazz.toLowerCase());
		}

		return(this);
	}

	public getAttributes() : Map<string,string>
	{
		return(this.attribss$);
	}

	public getAttribute(attr:string) : string
	{
		return(this.attribss$.get(attr.toLowerCase()));
	}

	public setAttribute(attr:string, value:any) : FieldProperties
	{
		attr = attr.toLowerCase();

		if (this.fixed$.includes(attr))
			return;

		if (this.structured$.includes(attr))
		{
			let flag:boolean = true;

			if (value != null && value.toLowerCase() == "false")
				flag = false;

			switch(attr)
			{
				case "hidden": this.hidden = flag; break;
				case "enabled": this.enabled = flag; break;
				case "readonly": this.readonly = flag; break;
				case "required": this.required = flag; break;

				case "style": this.setStyles(value); break;
				case "class": this.setClasses(value); break;
			}

			return;
		}

		let val:string = "";
		attr = attr.toLowerCase();

		if (value != null)
			val += value;

		this.attribss$.set(attr,val);
	}

	public removeAttribute(attr:string) : FieldProperties
	{
		attr = attr.toLowerCase();
		this.attribss$.delete(attr.toLowerCase());
		return(this);
	}

	public get value() : string
	{
		return(this.value$);
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

	public setValue(value:string) : FieldProperties
	{
		this.value = value;
		return(this);
	}

    public getValidValues() : Map<string,string>
	{
		return(this.values$);
    }

    public setValidValues(values: Set<string> | Map<string,string>) : FieldProperties
	{
		if (values instanceof Set)
		{
			this.values$ = new Map<string,string>();
			values.forEach((value) => {this.values$.set(value,value)});
		}
        else this.values$ = values;

		return(this);
    }

	public apply() : void
	{
		FieldFeatureFactory.merge(this,this.default$);
	}
}