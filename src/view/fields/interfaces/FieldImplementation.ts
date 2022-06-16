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

import { FieldEventHandler } from "./FieldEventHandler.js";
import { HTMLProperties } from "../HTMLProperties.js";

export enum FieldState
{
	OPEN,
	READONLY,
	DISABLED
}

export interface FieldImplementation
{
	apply(properties:HTMLProperties) : void
	create(container:FieldEventHandler) : HTMLInputElement;

	getValue() : any;
    getStringValue() : string;
    setValue(value:any) : boolean;
	setStringValue(value:string) : void;

	getFieldState() : FieldState;
	setFieldState(state:FieldState) : void;

    getElement() : HTMLElement;
}
