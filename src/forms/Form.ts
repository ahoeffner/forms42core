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
import { Parser } from '../tags/Parser';
import { Include } from '../tags/Include';
import { DynamicCall } from '../utils/DynamicCall';
import { FormsModule } from '../application/FormModule';
import { Window } from '../application/interfaces/Window';
import { Properties, Tag } from '../application/Properties';
import { WindowComponent } from "../application/WindowComponent";
import { ComponentFactory } from '../application/interfaces/ComponentFactory';

class State
{
    page:Element = null;
    navigable:boolean = true;
    handler:EventHandler = null;
    module:FormsModule = FormsModule.get();
}

class EventHandler implements EventListenerObject
{
    private events:Map<Element,Map<string,DynamicCall>> =
        new Map<Element,Map<string,DynamicCall>>();

    constructor(private form:Form) {};

    public addEvent(element:Element,event:string,handler:DynamicCall) :string
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
        return(events.get(event));
    }

    public handleEvent(event:Event): void
    {
        let handler:DynamicCall = this.getEvent(event.target as Element,event.type);
        this.form[handler.method].apply(this.form,handler.args);
    }
}


export class Form implements WindowComponent
{
    static seq:number = 0;
    public id:number = ++Form.seq;

    public window:Window = null;
    private state:State = new State();

    constructor(page?:string)
    {
        this.state.handler = new EventHandler(this);
        if (page != null) this.setPage(page);
    }

    public get navigable() : boolean
    {
        return(this.state.navigable);
    }

    public set navigable(navigable:boolean)
    {
        this.state.navigable = navigable;
    }

    public getPage() : Element
    {
        return(this.state.page);
    }

    public setPage(page:string|Element)
    {
        console.log("parse form "+this.id);
        if (typeof page === 'string')
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }

        let parser:Parser = new Parser(page);
        let factory:ComponentFactory = Properties.FactoryImpl;

        parser.tags.get(Tag.Include).forEach((element) =>
        {
            let src:string = element.getAttribute("src");
            let impl:Class<any> = this.state.module.getComponent(src);

            if (impl == null)
                throw "No include class mapped tp "+src;

            let replace:Element = null;
            let incl:Include = factory.createInclude(impl);

            if (typeof incl.content === 'string')
            {
                let template:HTMLTemplateElement = document.createElement('template');
                template.innerHTML = incl.content; replace = template.content.getRootNode().firstChild as Element;
            }
            else replace = incl.content;

            element.replaceWith(replace);

            let fragment:Parser = new Parser(replace);

            fragment.events.forEach((event,element) =>
            {
                for (let i = 0; i < event.length; i++)
                {
                    let func:DynamicCall = new DynamicCall(event[i][1]);
                    let ename:string = this.state.handler.addEvent(element,event[i][0],func);
                    element.addEventListener(ename,this.state.handler);
                }
            });
        });

        parser.events.forEach((event,element) =>
        {
            for (let i = 0; i < event.length; i++)
            {
                let func:DynamicCall = new DynamicCall(event[i][1]);
                let ename:string = this.state.handler.addEvent(element,event[i][0],func);
                element.addEventListener(ename,this.state.handler);
            }
        });

        this.state.page = page;
    }

    public close() : boolean
    {
        console.log("close window: "+this)
        this.window.close();
        return(true);
    }
}