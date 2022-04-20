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

import { Menu } from './interfaces/Menu.js';
import { MenuEntry } from './interfaces/MenuEntry.js';


export class MenuHandler implements EventListenerObject
{
	private menu:Menu = null;
	private classes:string = null;
	private target:HTMLElement = null;
	private link:string = "menu-entry";
    private status:Map<string,boolean> = new Map<string,boolean>();

	constructor(menu:Menu, target:HTMLElement)
	{
		this.menu = menu;
		this.target = target;
	}

	public show() : void
	{
		this.classes = this.link;
		this.target.innerHTML = this.showEntry(this.menu.getEntries("/"));
		let entries:NodeList = this.target.querySelectorAll("."+this.link);

		entries.forEach((link) =>
		{
			link.addEventListener("click",this);
		});
	}

	public hide() : void
	{
		this.target.innerHTML = "";
	}

	public toggle(path:string) : void
	{
		let entries:MenuEntry[] = this.menu.getEntries(path);

		let open:boolean = this.status.get(path);
		this.status.clear();
	}

	private showEntry(entries:MenuEntry[], path?:string, page?:string) : string
	{
		if (page == null) page = "";
		if (path == null) path = "/";
		if (path.length > 1) path += "/";

		for (let i = 0; i < entries.length; i++)
		{
			page += "<a class='"+this.classes+"' path='"+path+entries[i].id+"'>"+entries[i].text+"</a>";
		}

		return(page);
	}

	public async handleEvent(link:Event)
	{
		let elem:HTMLAnchorElement = link.target as HTMLAnchorElement;
		let close:boolean = await this.menu.execute(elem.getAttribute("path"));
		console.log("returned "+close);
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