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

import { Properties, Tag } from '../application/Properties';

export class Parser
{
    public tags:Map<Tag,Element[]> = new Map<Tag,Element[]>();
    public events:Map<Element,string[]> = new Map<Element,string[]>();

    constructor(doc:Element)
    {
        if (!Properties.parseTags && !Properties.parseClasses && !Properties.parseEvents)
            return;
            
        let list:NodeListOf<Element> = doc.querySelectorAll("*");

        for (let it = 0; it < list.length; it++)
        {
            let element:Element = list.item(it);

            this.addByTag(element);
            this.addByClass(element);
            this.addEvents(element);
        }
    }

    private addByTag(element:Element) : void
    {
        if (!Properties.parseTags) return;
        let name:string = element.nodeName.toLowerCase();
        let tag:Tag = Properties.TagLibrary.get(name);

        if (tag != null)
        {
            let bucket:Element[] = this.tags.get(tag);

            if (bucket == null)
            {
                bucket = [];
                this.tags.set(tag,bucket);
            }

            if (bucket.indexOf(element) == -1)
                bucket.push(element);
        }
    }

    private addByClass(element:Element) : void
    {
        if (!Properties.parseClasses) return;
        let list:string = element.getAttribute("class");

        if (list == null) return;
        let classes:string[] = list.trim().split(" ");

        for (let i = 0; i < classes.length; i++)
        {
            let name:string = classes[i];
            let tag:Tag = Properties.TagLibrary.get(name);

            if (tag != null)
            {
                let bucket:Element[] = this.tags.get(tag);

                if (bucket == null)
                {
                    bucket = [];
                    this.tags.set(tag,bucket);
                }

                if (bucket.indexOf(element) == -1)
                    bucket.push(element);
            }
        }
    }

    private addEvents(element:Element) : void
    {
        if (!Properties.parseEvents) return;
        let attrname:string[] = element.getAttributeNames();

        for (let an = 0; an < attrname.length; an++)
        {
            let attrvalue:string = element.getAttribute(attrname[an]);
            if (attrvalue != null) attrvalue = attrvalue.trim();

            let evtype:boolean = attrname[an].startsWith("on");
            let handle:boolean = attrvalue != null && attrvalue.startsWith("this.");

            if (evtype && handle)
            {
                element.removeAttribute(attrname[an]);
                this.events.set(element,[attrname[an],attrvalue]);
            }
        }
    }
}