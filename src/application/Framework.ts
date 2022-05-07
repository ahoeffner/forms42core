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

import { Tag } from '../tags/Tag.js';
import { Class } from '../types/Class.js';
import { Logger, Type } from './Logger.js';
import { Properties } from './Properties.js';
import { ComponentFactory } from './interfaces/ComponentFactory.js';


export class Framework
{
    private component:any = null;
    private static taglib:Map<string,Tag> = Framework.initTaglib();
    private static attrlib:Map<string,Tag> = Framework.initAttrlib();
    private tags:Map<string,HTMLElement[]> = new Map<string,HTMLElement[]>();

    public eventhandler:EventHandler = null;
    public events:Map<Element,string[][]> = new Map<Element,string[][]>();

    private static initTaglib() : Map<string,Tag>
    {
		Framework.taglib = new Map<string,Tag>();
		Properties.getTagLibrary().forEach((clazz,tag) => {Framework.addTag(tag,clazz);});
		return(Framework.taglib);
    }

    private static initAttrlib() : Map<string,Tag>
    {
		Framework.attrlib = new Map<string,Tag>();
		Properties.getAttributeLibrary().forEach((clazz,tag) => {Framework.addAttr(tag,clazz);});
		return(Framework.attrlib);
    }

    public static addTag(tag:string,clazz:Class<Tag>) : void
    {
        tag = tag.toLowerCase();

        let factory:ComponentFactory = Properties.FactoryImplementationClass;
        let impl:Tag = factory.createBean(clazz);

        Framework.taglib.set(tag,impl);
    }

    public static addAttr(tag:string,clazz:Class<Tag>) : void
    {
        tag = tag.toLowerCase();

        let factory:ComponentFactory = Properties.FactoryImplementationClass;
        let impl:Tag = factory.createBean(clazz);

        Framework.attrlib.set(tag,impl);
    }

    public static parse(component:any, doc:Element) : Framework
    {
        return(new Framework(component,doc));
    }

    public static copyAttributes(fr:Element,to:Element) : void
    {
        if (fr == null || to == null) return;
        let attrnames:string[] = fr.getAttributeNames();

        for (let an = 0; an < attrnames.length; an++)
            to.setAttribute(attrnames[an],fr.getAttribute(attrnames[an]));
    }

    private constructor(component:any, doc:Element)
    {
        this.component = component;
        this.eventhandler = new EventHandler(component);

        if (!Properties.ParseTags && !Properties.ParseEvents)
            return;

        this.parseDoc(doc);
        this.applyEvents();
    }

    public getTag(tag:string) : Element[]
    {
        tag = tag.toLowerCase();
        let elements:Element[] = this.tags.get(tag);
        if (elements == null) elements = [];
        return(elements);
    }

    private parseDoc(doc:Element) : void
    {
        if (doc == null) return;

        for (let i = 0; i < doc.childNodes.length; i++)
        {
            let node:Node = doc.children.item(i);
            if (!(node instanceof HTMLElement)) continue;

            let impl:Tag = null;
			let attr:string = null;
            let element:HTMLElement = node;
            let tag:string = element.nodeName.toLowerCase();

            if (Properties.ParseTags)
			{
                impl = Framework.taglib.get(tag);

				let attrnames:string[] = element.getAttributeNames();

				for (let an = 0; impl == null && an < attrnames.length; an++)
				{
					impl = Framework.attrlib.get(attrnames[an]);
					if (impl != null) attr = attrnames[an];
				}
			}

            if (impl != null)
            {
                let replace:HTMLElement|HTMLElement[]|string = impl.parse(this.component,element,attr);
                Logger.log(Type.htmlparser,"Resolved tag: '"+tag+"' using class: "+impl.constructor.name);

                if (replace == null)
                {
                    element.remove();
                    element = null;
                }
                else
                {
                    if (typeof replace === "string")
                    {
                        let template:HTMLTemplateElement = document.createElement('template');
                        template.innerHTML = replace; replace = template.content.getRootNode() as HTMLElement;
                    }

					if (!Array.isArray(replace))
						replace = [replace];

					for(let r=replace.length-1; r >= 0; r--)
					{
						// Wrong
						if (replace instanceof HTMLElement)
							this.setTag(tag,replace[r]);

						if (r == replace.length-1) doc.replaceChild(replace[r],element);
						else 					   doc.insertBefore(replace[+r+1],replace[r]);

						if (replace.length > 1)
							console.log("tag r="+r+" "+replace[r].innerHTML);
					}

					for(let r=0; r < replace.length; r++)
					{
						if (replace[r] instanceof HTMLElement)
							this.setTag(tag,replace[r]);

						this.parseDoc(replace[r]);
					}
                }

                continue;
            }

            this.addEvents(element);
            this.parseDoc(element);
        }
    }

    private addEvents(element:Element) : void
    {
        if (element == null) return;
        if (!Properties.ParseEvents) return;

        let attrnames:string[] = element.getAttributeNames();

        for (let an = 0; an < attrnames.length; an++)
        {
            let attrvalue:string = element.getAttribute(attrnames[an]);
            if (attrvalue != null) attrvalue = attrvalue.trim();

			if (!attrnames[an].startsWith(Properties.EventPrefix))
				continue;

			attrnames[an] = attrnames[an].substring(Properties.EventPrefix.length);

            if (attrvalue != null)
            {
                let events:string[][] = this.events.get(element);

                if (events == null)
                {
                    events = [];
                    this.events.set(element,events);
                }

                events.push([attrnames[an],attrvalue]);
                element.removeAttribute(attrnames[an]);

                Logger.log(Type.eventparser,"Add event: '"+attrvalue+"' for: "+attrnames[an]);
            }
        }
    }

    private applyEvents() : void
    {
        if (Properties.ParseEvents && this.component != null)
        {
            this.events.forEach((event,element) =>
            {
                for (let i = 0; i < event.length; i++)
                {
                    let func:DynamicCall = new DynamicCall(event[i][1]);
                    let ename:string = this.eventhandler.addEvent(element,event[i][0],func);
                    element.addEventListener(ename,this.eventhandler);
                }
            });
        }
    }

    private setTag(tag:string,element:HTMLElement) : void
    {
        let elements:HTMLElement[] = this.tags.get(tag);

        if (elements == null)
        {
            elements = [];
            this.tags.set(tag,elements);
        }

        elements.push(element);
    }
}


export class DynamicCall
{
    public path:string[];
    public method:string;
    public args:string[] = [];

    constructor(signature:string)
    {
        this.parse(signature);
    }

    private parse(signature:string) : void
    {
        if (signature.startsWith("this."))
            signature = signature.substring(5);

        let pos1:number = signature.indexOf("(");
        let pos2:number = signature.indexOf(")");

        this.path = signature.substring(0,pos1).split(".");
        let arglist:string = signature.substring(pos1+1,pos2).trim();

        let n:number = 0;
        let arg:string = "";
        let quote:string = null;
        this.method = this.path.pop();

        for(let i=0; i < arglist.length; i++)
        {
            let c:string = arglist.charAt(i);

            if (c == "," && quote == null)
            {
                if (arg.length > 0)
                {
                    this.args.push(arg);
                    n++;
                    arg = "";
                }

                continue;
            }

            if (c == "'" || c == '"')
            {
                if (quote != null && c == quote)
                {
                    n++;
                    quote = null;
                    continue;
                }

                else

                if (quote == null)
                {
                    quote = c;
                    continue;
                }
            }

            arg += c;
        }

        if (this.args.length < n)
            this.args.push(arg);
    }

    public invoke(component:any) : void
    {
        for(let i = 0; i < this.path.length; i++)
        {
            if (!component[this.path[i]])
			{
				let problem:string = "is null";
				if (!(this.path[i] in component)) problem = "does not exists";
                throw "@Framework: Attribute : '"+this.path[i]+"' on component: '"+component.constructor.name+"' "+problem;
			}

            component = component[this.path[i]];
        }

        try
        {
            switch(this.args.length)
            {
                case 0: component[this.method](); break;
                case 1: component[this.method](this.args[0]); break;
                default: component[this.method](...this.args);
            }
        }
        catch (error)
        {
            throw "@Framework: Failed to invoke method: '"+this.method+"' on component: "+component.constructor.name;
        }
    }
}


class EventHandler implements EventListenerObject
{
    private events:Map<Element,Map<string,DynamicCall>> =
        new Map<Element,Map<string,DynamicCall>>();

    constructor(private component:any) {}

    public addEvent(element:Element,event:string,handler:DynamicCall) : string
    {
        let events:Map<string,DynamicCall> = this.events.get(element);
        if (event.toLowerCase().startsWith("on")) event = event.substring(2);

        if (events == null)
        {
            events = new Map<string,DynamicCall>();
            this.events.set(element,events);
        }

        events.set(event,handler);
        return(event);
    }

    public getEvent(element:Element,event:string) : DynamicCall
    {
        let events:Map<string,DynamicCall> = this.events.get(element);
        if (events == null) return(null);
        return(events.get(event));
    }

    public handleEvent(event:Event): void
    {
        let elem:Element = event.target as Element;
        let method:DynamicCall = this.getEvent(elem,event.type);

        if (method == null)
        {
            while (method == null && elem.parentElement != document.body.parentElement)
            {
                elem = elem.parentElement;
                method = this.getEvent(elem,event.type);
            }
        }

        if (method != null) method.invoke(this.component);
        else throw "@Framework: Cannot find "+event.type+" on this or parent any elements";
    }
}