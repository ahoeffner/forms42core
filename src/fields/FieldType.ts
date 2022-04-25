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
import { Input } from "./implementations/Input.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";


export class FieldTypes
{
	private static exceptions:Map<string,Class<FieldImplementation>> =
		FieldTypes.init();


	private static init() : Map<string,Class<FieldImplementation>>
	{
		let map:Map<string,Class<FieldImplementation>> =
			new Map<string,Class<FieldImplementation>>();

		map.set("dropdown",null);
		return(map);
	}

	public static get(type:string) : Class<FieldImplementation>
	{
		if (type == null) return(Input);
		let impl:Class<FieldImplementation> = FieldTypes.exceptions.get(type.toLowerCase());
		if (impl == null) impl = Input;
		return(impl);
	}
}