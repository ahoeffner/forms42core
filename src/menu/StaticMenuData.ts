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

import { MenuData } from "./interfaces/MenuData.js";
import { MenuEntry } from "./interfaces/MenuEntry.js";
import { StaticMenuEntry } from "./interfaces/StaticMenuEntry.js";

export class StaticMenuData implements MenuData
{
	private menu:Map<string,StaticMenuEntry> = new Map<string,StaticMenuEntry>();

	constructor(public entries:StaticMenuEntry)
	{
		this.index("/",entries);
	}

	public getEntries(path:string) : MenuEntry[]
	{
		return(this.menu.get(path).entries);
	}

	public index(path:string, entry:StaticMenuEntry) : void
	{
		this.menu.set(path,entry);
		console.log("index <"+path+">");

		for (let i = 0; entry.entries != null && i < entry.entries.length; i++)
		{
			let npath:string = path;
			if (npath.length > 1) npath += "/";
			npath += entry.entries[i].id;
			this.index(npath,entry.entries[i]);
		}
	}
}