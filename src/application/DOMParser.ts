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

import { Class } from '../types/Class.js';
import { Include } from '../tags/Include.js';
import { FormsModule } from './FormsModule.js';
import { Implementation, Properties, Tag } from './Properties.js';
import { ComponentFactory } from './interfaces/ComponentFactory.js';


export class DOMParser
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

            if (tincl || cincl) this.include(element);
        }
    }

    private addByTag(element:Element) : boolean
    {
        if (!Properties.parseTags) return(false);
        let name:string = element.nodeName.toLowerCase();
        let impl:Implementation = Properties.TagLibrary.get(name);

        if (impl != null)
        {
            element = this.replace(element,impl);
            let bucket:Element[] = this.tags.get(impl.tag);

            if (bucket == null)
            {
                bucket = [];
                this.tags.set(impl.tag,bucket);
            }

            if (bucket.indexOf(element) == -1)
                bucket.push(element);

            this.addEvents(element);
            return(impl.tag == Tag.Include);
        }

        this.addEvents(element);
        return(false);
    }

    private addByClass(element:Element) : boolean
    {
        if (!Properties.parseClasses) return(false);
        let list:string = element.getAttribute("class");

        if (list == null) return;
        let include:boolean = false;
        let classes:string[] = list.trim().split(" ");

        for (let i = 0; i < classes.length; i++)
        {
            let name:string = classes[i];
            let impl:Implementation = Properties.TagLibrary.get(name);

            if (impl != null)
            {
                if (impl.tag == Tag.Include) include = true;
                let bucket:Element[] = this.tags.get(impl.tag);

                if (bucket == null)
                {
                    bucket = [];
                    this.tags.set(impl.tag,bucket);
                }

                if (bucket.indexOf(element) == -1)
                    bucket.push(element);
            }
        }

        this.addEvents(element);
        return(include);
    }

    private addEvents(element:Element) : void
    {
        if (!Properties.parseEvents) return;
        let attrnames:string[] = element.getAttributeNames();

        for (let an = 0; an < attrnames.length; an++)
        {
            let attrvalue:string = element.getAttribute(attrnames[an]);
            if (attrvalue != null) attrvalue = attrvalue.trim();

            let evtype:boolean = attrnames[an].startsWith("on");
            let handle:boolean = attrvalue != null && attrvalue.startsWith("this.");

            if (evtype && handle)
            {
                let events:string[][] = this.events.get(element);

                if (events == null)
                {
                    events = [];
                    this.events.set(element,events);
                }

                events.push([attrnames[an],attrvalue]);
                element.removeAttribute(attrnames[an]);
            }
        }
    }

    private include(element:Element) : void
    {
        let src:string = element.getAttribute("src");
        let impl:Class<any> = this.module.getComponent(src);
        let factory:ComponentFactory = Properties.FactoryImplementationClass;

        if (impl == null)
            throw "No include class mapped tp "+src;

        let replace:Element = null;
        let incl:Include = factory.createInclude(impl);

        if (typeof incl.content === "string")
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = incl.content; replace = template.content.getRootNode() as Element;
        }
        else replace = incl.content;

        let fragment:DOMParser = new DOMParser(replace);

        fragment.events.forEach((event,element) =>
            {this.events.set(element,event);});

        element.replaceWith(replace);
    }


    private replace(element:Element, impl:Implementation) : Element
    {
        if (impl.element == null) return(element);
        let attrnames:string[] = element.getAttributeNames();
        let replace:Element = document.createElement(impl.element);

        replace.setAttribute("name",Tag[impl.tag].toLowerCase());

        for (let an = 0; an < attrnames.length; an++)
            replace.setAttribute(attrnames[an],element.getAttribute(attrnames[an]));

        element.replaceWith(replace);
        return(replace);
    }
}