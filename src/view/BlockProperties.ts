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

import { FieldInstance } from "./fields/FieldInstance.js";
import { FieldProperties } from "./fields/FieldProperties.js";


export class BlockProperties
{
	private defaults$:Map<FieldInstance,FieldProperties> =
		new Map<FieldInstance,FieldProperties>();

	private overrides$:Map<object,Map<FieldInstance,FieldProperties>> =
		new Map<object,Map<FieldInstance,FieldProperties>>();

	public static consume(tag:HTMLElement) : FieldProperties
	{
		let skip:string[] = ["id","name","block","row"];
		let props:FieldProperties = new FieldProperties();

		props.setTag(tag.tagName);
		props.setSubType(tag.getAttribute("type"));

		for (let cls of tag.classList.values())
			props.setClass(cls);

		let an:string[] = tag.getAttributeNames();

		an.forEach((name) =>
		{
			if (!skip.includes(name.toLowerCase()))
				props.setAttribute(name,tag.getAttribute(name));
		});

		return(props);
	}
}