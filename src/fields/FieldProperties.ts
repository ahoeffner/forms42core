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

export class FieldProperties
{
	private type:string = null;
	private attrs:string[] = [];
	private classes:string[] = [];

	private static properties:Map<string,Map<string,FieldProperties>> =
		new Map<string,Map<string,FieldProperties>>();

	public static get(name:string, id:string) : FieldProperties
	{
		let ids:Map<string,FieldProperties> = FieldProperties.properties.get(name);

		if (ids == null)
		{
			ids = new Map<string,FieldProperties>();
			FieldProperties.properties.set(name,ids);
		}

		let props:FieldProperties = ids.get(id);

		if (props == null)
		{
			props = new FieldProperties();
			ids.set(id,props);
		}

		return(props);
	}
}