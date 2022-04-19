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

import { MenuData } from './interfaces/MenuData.js';
import { StaticMenuData } from './StaticMenuData.js';
import { MenuEntry } from './interfaces/MenuEntry.js';
import { StaticMenuEntry } from './interfaces/StaticMenuEntry.js';


export class Menu
{
	private data:MenuData = null;
	private target:HTMLElement = null;
    private status:Map<string,boolean> = new Map<string,boolean>();

	public setMenuData(data:MenuData|StaticMenuEntry) : void
	{
		if (data["getEntries"]) this.data = data as MenuData;
		else this.data = new StaticMenuData(data as StaticMenuEntry);
	}

	public setTarget(target:HTMLElement) : void
	{
		this.target = target;
	}

	public show() : void
	{
		null;
	}

	public toggle(path:string) : void
	{
		let entries:MenuEntry[] = this.data.getEntries(path);

		let open:boolean = this.status.get(path);
		this.status.clear();
	}

    private split(path:string) : string[]
    {
        let road:string = "/";
        let parts:string[] = [];
        let split:string[] = path.trim().split("/");

        parts.push("/");
        split.forEach((elem) =>
        {
            if (elem.length > 0)
            {
                road += elem + "/";
                parts.push(road);
            }
        });

        return(parts);
    }
}