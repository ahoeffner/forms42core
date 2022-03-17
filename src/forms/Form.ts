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

import { Parser } from '../tags/Parser';
import { Window } from '../application/interfaces/Window';
import { WindowComponent } from "../application/WindowComponent";
import { DynamicCall } from '../application/DynamicCall';

class State
{
    page:Element = null;
    window:Window = null;
    navigable:boolean = true;
}

export class Form implements WindowComponent
{
    private state:State = new State();

    constructor(page?:string)
    {
        this.setPage(page);
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

    public setWindow(window:Window): void
    {
        this.state.window = window;
    }

    public setPage(page:string|Element)
    {
        if (typeof page === 'string')
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }

        let parser:Parser = new Parser(page);

        parser.events.forEach((event,element) =>
        {
            for (let i = 0; i < event.length; i++)
            {
                let func:DynamicCall = new DynamicCall(event[i][1]);
                this[func.method].apply(null,func.args);
            }
        });

        this.state.page = page;
    }

    public closeWindow() : void
    {
        this.state.window.dismiss();
    }

    public close() : boolean
    {
        this.closeWindow();
        return(true);
    }
}