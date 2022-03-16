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

import { WindowComponent } from "../application/WindowComponent";

class State
{
    page:Element = null;
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

    public setPage(page:string|Element)
    {
        if (typeof page === 'string')
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }
        this.state.page = page;
    }

    public getPage() : Element
    {
        return(this.state.page);
    }

    public close() : boolean
    {
        return(true);
    }
}