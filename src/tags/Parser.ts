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

import { Class } from '../types/Class';
import { Include } from '../tags/Include';
import { FormsModule } from '../application/FormsModule';
import { Properties, Tag } from '../application/Properties';
import { ComponentFactory } from '../application/interfaces/ComponentFactory';


export class Parser
{
    private module:FormsModule = FormsModule.get();
    public tags:Map<Tag,Element[]> = new Map<Tag,Element[]>();
    public events:Map<Element,string[][]> = new Map<Element,string[][]>();

    constructor(doc:Element)
    {
        if (!Properties.parseTags && !Properties.parseClasses && !Properties.parseEvents)
            return;

        this.parse(doc);
    }

    private parse(doc:Element) : void
    {
        let list:NodeListOf<Element> = doc.querySelectorAll("*");

        for (let it = 0; it < list.length; it++)
        {
            let element:Element = list.item(it);

            let tincl:boolean = this.addByTag(element);
            let cincl:boolean = this.addByClass(element);

            this.addEvents(element);
            if (tincl || cincl) this.include(element);
        }
    }

    private addByTag(element:Element) : boolean
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

        return(tag == Tag.Include);
    }

    private addByClass(element:Element) : boolean
    {
        if (!Properties.parseClasses) return;
        let list:string = element.getAttribute("class");

        if (list == null) return;
        let include:boolean = false;
        let classes:string[] = list.trim().split(" ");

        for (let i = 0; i < classes.length; i++)
        {
            let name:string = classes[i];
            let tag:Tag = Properties.TagLibrary.get(name);

            if (tag != null)
            {
                if (tag == Tag.Include) include = true;
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
                let events:string[][] = this.events.get(element);

                if (events == null)
                {
                    events = [];
                    this.events.set(element,events);
                }

                events.push([attrname[an],attrvalue]);
                element.removeAttribute(attrname[an]);
            }
        }
    }

    private include(element:Element) : void
    {
        let src:string = element.getAttribute("src");
        let impl:Class<any> = this.module.getComponent(src);
        let factory:ComponentFactory = Properties.FactoryImpl;

        if (impl == null)
            throw "No include class mapped tp "+src;

        let replace:Element = null;
        let incl:Include = factory.createInclude(impl);

        if (typeof incl.content === 'string')
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = incl.content; replace = template.content.getRootNode() as Element;
        }
        else replace = incl.content;

        let fragment:Parser = new Parser(replace);

        fragment.events.forEach((event,element) =>
            {this.events.set(element,event);});

        element.replaceWith(replace);
    }
}