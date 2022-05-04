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
	private classes:string[] = [];
	private attrs:Map<string,string> = new Map<string,string>();

	public static get(component:any,block:string,field:string,id:string) : FieldProperties
	{
		let properties:PropertyMap = BlockMap.get(component,block);
		return(properties.get(field,id));
	}

	public initialize(element:HTMLElement) : void
	{
		let skip:string[] = ["id","name","type","block","row"];

		for (let cls of element.classList.values())
			this.classes.push(cls);

		let an:string[] = element.getAttributeNames();
		an.forEach((name) =>
		{
			if (!skip.includes(name.toLowerCase()))
				this.attrs.set(name,element.getAttribute(name));
		});
	}
}


class BlockMap
{
	// PropertyMap by component and block

	private static properties:Map<any,Map<string,PropertyMap>> =
		new Map<any,Map<string,PropertyMap>>();

	public static get(component:any,block:string) : PropertyMap
	{
		let pmap:Map<string,PropertyMap> = BlockMap.properties.get(component);

		if (pmap == null)
		{
			pmap = new Map<string,PropertyMap>();
			BlockMap.properties.set(component,pmap);
		}

		let props:PropertyMap = pmap.get(block);

		if (props == null)
		{
			props = new PropertyMap();
			pmap.set(block,props);
		}

		return(props);
	}
}


class PropertyMap
{
	// Properties by field and id

	private properties:Map<string,Map<string,FieldProperties>> =
		new Map<string,Map<string,FieldProperties>>();

	public get(field:string,id:string) : FieldProperties
	{
		let map:Map<string,FieldProperties> = this.properties.get(field);

		if (map == null)
		{
			map = new Map<string,FieldProperties>();
			this.properties.set(field,map);
		}

		let props:FieldProperties = map.get(id);

		if (props == null)
		{
			props = new FieldProperties();
			map.set(id,props);
		}

		return(props);
	}
}