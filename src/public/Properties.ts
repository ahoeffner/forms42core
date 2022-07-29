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

import { Class } from "../types/Class.js";
import { DataMapper } from "../view/fields/DataMapper.js";

export interface Properties
{
	setTag(tag:string) : Properties;

	setHidden(flag:boolean) : Properties;
	setEnabled(flag:boolean) : Properties
	setReadOnly(flag:boolean) : Properties;
	setRequired(flag:boolean) : Properties;

	setStyles(styles:string) : Properties;
	removeStyle(style:string) : Properties;
	setStyle(style:string, value:string) : Properties;

	setClass(clazz:any) : Properties;
	removeClass(clazz:any) : Properties;
	setClasses(classes:string|string[]) : Properties;

	removeAttribute(attr:string) : Properties;
	setAttribute(attr:string, value:any) : Properties;

	setValue(value:string) : Properties;
	setValidValues(values: Set<string> | Map<string,string>) : Properties;
	
	setMapper(mapper:Class<DataMapper>|DataMapper|string) : Properties;
	apply() : void;
}