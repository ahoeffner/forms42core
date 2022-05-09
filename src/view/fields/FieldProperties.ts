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

	constructor(element:HTMLElement)
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

	public getClasses() : string
	{
		if (this.classes.length == 0)
			return(null);

		let classes:string = null;
		for(let i = 0; i < this.classes.length; i++)
		{
			if (classes == null) classes = "";
			else 				 classes += ",";
			classes += this.classes[i];
		}

		return(classes);
	}

	public getAttributes() : Map<string,string>
	{
		return(this.attrs);
	}

	public hasClass(clazz:string) : boolean
	{
		return(this.classes.includes(clazz));
	}
}
