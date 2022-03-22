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
import { Logger, Type } from './Logger.js';
import { Framework } from './Framework.js';
import { Properties } from './Properties.js';
import { Application } from './Application.js';

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
            Logger.log(Type.classloader,"Loading class: "+clazz.name+" into position: "+path);
        });
    }

    return(define);
}


class State
{
    root:Element;
    appl:Application;
    framework:Framework;

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
        this.state.root = document.body;
        this.state.appl = new Application(this);
    }

    public getRootElement() : Element
    {
        return(this.state.root);
    }

    public setRootElement(root:Element) : void
    {
        this.state.root = root;
    }

    public getApplication() : Application
    {
        return(this.state.appl);
    }

    public addComponent(clazz:Class<any>, path?:string) : void
    {
        if (path == null) path = clazz.name.toLowerCase();
        State.components.set(path,clazz);
    }

    public getComponent(path:string) : Class<any>
    {
        return(State.components.get(path.toLowerCase()));
    }

    public parseIndexPage(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        this.state.framework = Framework.parse(this,doc);
        let roots:Element[] = this.state.framework.getTag(Properties.root);

        if (roots.length >= 1)
            this.state.root = roots[0];
    }
}