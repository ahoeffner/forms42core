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

import { Form } from "../forms/Form";
import { Class } from "../types/Class";
import { Properties } from "./Properties";
import { Application } from "./Application";
import { Window } from "./interfaces/Window";
import { WindowManager } from "./WindowManager";
import { ComponentFactory } from "./interfaces/ComponentFactory";

export interface Component
{
    path:string;
    class:Class<any>;
}

function isComponent(object: any): object is Component
{
    return('path' in object && 'class' in object);
}


export const ModuleDefinition = (components:(Class<any> | Component)[]) =>
{
    function define(_comp_:Class<any>)
    {
        components.forEach(element =>
        {
            let path:string = null;
            let clazz:Class<any> = null;

            if (isComponent(element))
            {
                clazz = (element as Component).class;
                path = (element as Component).path.toLowerCase();
            }
            else
            {
                clazz = element as Class<any>;
                path = (element as Class<any>).name.toLowerCase();
            }

            State.components.set(path,clazz);
        });
    }

    return(define);
}


class State
{
    root:Element;
    appl:Application;

    static components:Map<string,Class<any>> =
        new Map<string,Class<any>>();
}


export class FormsModule
{
    private state:State = new State();
    private static instance:FormsModule;

    public static get() : FormsModule
    {
        if (FormsModule.instance == null)
            FormsModule.instance = new FormsModule();
        return(FormsModule.instance);
    }

    constructor()
    {
        FormsModule.instance = this;
        this.state.appl = new Application();
    }

    public getRootElement() : Element
    {
        return(this.state.root);
    }

    public getComponent(path:string) : Class<any>
    {
        return(State.components.get(path));
    }

    public getApplication() : Application
    {
        return(this.state.appl);
    }

    public parseByTags(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        this.state.root = doc.querySelector('forms');
    }

    public parseByClasses(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        this.state.root = doc.querySelector('.forms');
    }

    /*
    public showform(path:string) : void
    {
        path = path.toLowerCase();
        let comp:Class<any> = FormsModule.components.get(path);

        let factory:ComponentFactory = Properties.FactoryImpl;
        let winimpl:Class<Window> = Properties.WindowImplClass;

        if (comp == null)
            throw "No components mapped to path '"+path+"'";

        if (!(comp.prototype instanceof Form))
            throw "Component mapped to '"+path+"' is not a form";

        let window:Window = new winimpl();
        let form:Form = factory.createForm(comp);

        window.setComponent(form);
        this.state.winmgr.add(null,window);
        this.state.root.appendChild(window.getPage());

        setTimeout(() => {
            console.log("close");
            window.close();
        },5000);
    }
        */
}