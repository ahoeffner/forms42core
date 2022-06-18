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
import { Application } from './Application.js';
import { KeyMap, KeyMapping } from '../control/events/KeyMap.js';

export interface Component
{
    path:string;
    class:Class<any>;
}

function isComponent(object: any): object is Component
{
    return('path' in object && 'class' in object);
}

export const BaseURL = (url:string) =>
{
    function define(_comp_:Class<FormsModule>)
	{
		State.baseurl = url;
	}

	return(define);
}

export const FormsPathMapping = (components:(Class<any> | Component)[]) =>
{
    function define(_comp_:Class<FormsModule>)
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
	static baseurl:string;
    static root:HTMLElement;
    static appl:Application;

    static components:Map<string,Class<any>> =
        new Map<string,Class<any>>();
}

export class FormsModule
{
    private static instance:FormsModule;

    public static get() : FormsModule
    {
        if (FormsModule.instance == null)
            FormsModule.instance = new FormsModule();
        return(FormsModule.instance);
    }

	public static platform() : string
	{
		let plf:string = navigator.platform;
		if (plf == null) throw "@FormModule: Unable to detect platform";
		return(plf);
	}

    constructor()
    {
		KeyMapping.init();
        FormsModule.instance = this;
        State.appl = new Application(this);
    }

    public getRootElement() : HTMLElement
    {
        return(State.root);
    }

    public setRootElement(root:HTMLElement) : void
    {
        State.root = root;
    }

    public getApplication() : Application
    {
        return(State.appl);
    }

    public mapComponent(clazz:Class<any>, path?:string) : void
    {
        if (path == null) path = clazz.name.toLowerCase();
        State.components.set(path,clazz);
    }

    public getComponent(path:string) : Class<any>
    {
        return(State.components.get(path.toLowerCase()));
    }

    public parse(doc?:Element) : void
    {
        if (doc == null) doc = document.body;
        let frmwrk:Framework = Framework.parse(this,doc);

        let root:HTMLElement = frmwrk.getRoot();
        if (State.root == null) State.root = root;
		if (State.root == null) State.root = document.body;
    }

	public updateKeyMap(map:Class<KeyMap>) : void
	{
		KeyMapping.update(map);
	}

	public autoopen() : boolean
	{
		let url:string = window.location.pathname;
		let root:string = State.baseurl != null ? State.baseurl : "/";

		State.components

		return(true);
	}
}