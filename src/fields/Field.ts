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
import { FieldTypes } from "./FieldType.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";

export class Field
{
	private impl:FieldImplementation = null;

	constructor(placeholder:HTMLElement)
	{
		let ftype:string = placeholder.getAttribute("type");
		let impl:Class<FieldImplementation> = FieldTypes.get(ftype);
		this.impl = new impl(this);
	}

	public getImplementation() : FieldImplementation
	{
		return(this.impl);
	}
}