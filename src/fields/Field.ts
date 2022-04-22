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

import { Class } from "../types/Class";
import { FieldTypes } from "./FieldType";

export class Field
{
	constructor(placeholder:HTMLElement)
	{
		let ftype:string = placeholder.getAttribute("type");
		let impl:Class<any> = FieldTypes.map.get(ftype);

		//let impl:HTMLElement = document.createElement("div");
		//impl.innerHTML = "A new Field";
		//placeholder.replaceWith(impl);
	}
}