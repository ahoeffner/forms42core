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

import { FieldInstance } from "../FieldInstance";

export interface FieldImplementation
{
	getFieldInstance() : FieldInstance;
	initialize(instance:FieldInstance) : void;

    getValue() : any;
    getStringValue() : string;
    setValue(value:any) : boolean;

    getElement() : HTMLElement;

    getStyle() : string;
    setStyle(style:string) : void;

    setClass(clazz:string) : void;
    removeClass(clazz:string) : void;

    getClasses() : string;
    setClasses(classes:string) : void;

    removeAttribute(attr:string) : void;
    setAttribute(attr:string, value:string) : void;

    getProperties() : any;
    setProperties(properties:any) : void;

    getAttributes() : Map<string,any>;
    setAttributes(properties:Map<string,any>) : void;

    getValidValues() : Set<any> | Map<any, any>
    setValidValues(values:Set<any>|Map<any,any>) : void;

    enabled(flag:boolean) : void;
    readonly(flag:boolean) : void;

	setError(flag:boolean) : void;
}
