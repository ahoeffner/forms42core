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

import { Window } from "./Window";
import { Form } from "../forms/Form";
import { Class } from "../types/Class";
import { Application } from "./Application";

export interface Component
{
    path:string;
    class:Class<any>;
}


export const ModuleDefinition = (components:(Class<any> | Component)[]) =>
{
    function define(comp:Class<any>)
    {
        components.forEach(element =>
        {
            let path:string = null;
            let clazz:Class<any> = null;
            let comp:boolean = (element['path'] != null);

            if (comp)
            {
                clazz = (element as Component).class;
                path = (element as Component).path.toLowerCase();
            }
            else
            {
                clazz = element as Class<any>;
                path = (element as Class<any>).name.toLowerCase();
            }

            FormsModule["components"].set(path,clazz);
        });
    }

    return(define);
}


export class FormsModule
{
    private root:Element;
    private window:Element;
    private application$:Application;

    private static instance:FormsModule;

    private static components:Map<string,Class<any>> =
        new Map<string,Class<any>>();


    public static get() : FormsModule
    {
        if (FormsModule.instance == null)
            FormsModule.instance = new FormsModule();
        return(FormsModule.instance);
    }


    constructor()
    {
        FormsModule.instance = this;
        this.application$ = new Application();
    }

    public parseByTags(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        this.root = doc.querySelector('forms');
        this.window = document.createElement("div");
        this.root.appendChild(this.window);
    }

    public parseByClasses(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        this.root = doc.querySelector('.forms');
        this.window = document.createElement("div");
        this.root.appendChild(this.window);
    }

    public showform(path:string,instance?:string) : void
    {
        path = path.toLowerCase();
        let comp:Class<any> = FormsModule.components.get(path);

        if (comp == null)
            throw "No components mapped to path '"+path+"'";

        if (!(comp.prototype instanceof Form))
            throw "Component mapped to '"+path+"' is not a form";

        let form:Form = new comp();
        this.root.appendChild(form.getPage());
    }

    public callform(path:string,instance?:string) : void
    {
        path = path.toLowerCase();
        let comp:Class<any> = FormsModule.components.get(path);

        if (comp == null)
            throw "No components mapped to path '"+path+"'";

        if (!(comp.prototype instanceof Form))
            throw "Component mapped to '"+path+"' is not a form";

        let form:Form = new comp();
        let window:Window = new Window(form.getPage(),0);

        this.window.appendChild(window.getPage());

        setTimeout(() => {
            console.log("block");
            window.block();
        },5000);

        setTimeout(() => {
            console.log("unblock");
            window.unblock();
        },10000);
    }
}