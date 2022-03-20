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


interface parsed
{
    element:Element;
    include:boolean;
}


export class Framework
{
    private component:any = null;
    private module:FormsModule = FormsModule.get();

    public eventhandler:EventHandler = null;
    public tags:Map<Tag,Element[]> = new Map<Tag,Element[]>();
    public events:Map<Element,string[][]> = new Map<Element,string[][]>();

    public static parse(component:any, doc:Element) : Framework
    {
        return(new Framework(component,doc));
    }

    private constructor(component:any, doc:Element)
    {
        this.component = component;
        this.eventhandler = new EventHandler(component);

        if (!Properties.parseTags && !Properties.parseClasses && !Properties.parseEvents)
            return;

        this.parseAll(doc);
    }

    private parseAll(doc:Element) : void
    {
        let list:NodeListOf<Element> = doc.querySelectorAll("*");

        for (let it = 0; it < list.length; it++)
        {
            let element:Element = list.item(it);

            let tres:parsed = this.addByTag(element);
            let cres:parsed = this.addByClass(element);

            this.addEvents(element);

            if (tres.include || cres.include)
                this.include(element);
        }

        if (this.component != null)
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

    private addByTag(element:Element) : parsed
    {
        let retval:parsed =
        {
            include: false,
            element: element
        };

        if (!Properties.parseTags) return(retval);
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

            retval.element = element;
            retval.include = (impl.tag == Tag.Include);

            return(retval);
        }

        return(retval);
    }

    private addByClass(element:Element) : parsed
    {
        let retval:parsed =
        {
            include: false,
            element: element
        };

        if (!Properties.parseClasses) return(retval);
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
                let bucket:Element[] = this.tags.get(impl.tag);
                if (impl.tag == Tag.Include) retval.include = true;

                if (bucket == null)
                {
                    bucket = [];
                    this.tags.set(impl.tag,bucket);
                }

                if (bucket.indexOf(element) == -1)
                    bucket.push(element);
            }
        }

        return(retval);
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

        let fragment:Framework = new Framework(this.component,replace);

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


export class DynamicCall
{
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

        this.method = signature.substring(0,pos1);
        let arglist:string = signature.substring(pos1+1,pos2).trim();

        let n:number = 0;
        let arg:string = "";
        let quote:string = null;

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
}


class EventHandler implements EventListenerObject
{
    private events:Map<Element,Map<string,DynamicCall>> =
        new Map<Element,Map<string,DynamicCall>>();

    constructor(private component:any) {}

    public addEvent(element:Element,event:string,handler:DynamicCall) : string
    {
        event = event.substring(2); // get rid of "on" prefix
        let events:Map<string,DynamicCall> = this.events.get(element);

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
        let invoke:DynamicCall = this.getEvent(elem,event.type);

        if (invoke == null)
        {

            while (invoke == null && elem.parentElement != null)
            {
                elem = elem.parentElement;
                invoke = this.getEvent(elem,event.type);
            }
        }

        if (invoke != null)
        {
            try
            {
                console.log("args: "+invoke.args.length+" "+invoke.args);
                switch(invoke.args.length)
                {
                    case 0: this.component[invoke.method](); break;
                    case 1: this.component[invoke.method](invoke.args[0]); break;
                    default: this.component[invoke.method](...invoke.args);
                }
            }
            catch (error)
            {
                console.error("Failed to invoke method: '"+invoke.method+"' on component: "+this.component.constructor.name);
            }
        }
    }
}