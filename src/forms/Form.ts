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

import { Framework } from '../application/Framework.js';
import { FormsModule } from '../application/FormsModule.js';
import { Canvas } from '../application/interfaces/Canvas.js';
import { CanvasComponent } from '../application/CanvasComponent.js';


class State
{
    page:Element = null;
    moveable:boolean = true;
    navigable:boolean = true;
    resizable:boolean = true;
    module:FormsModule = FormsModule.get();
}



export class Form implements CanvasComponent
{
    public canvas:Canvas = null;
    private state:State = new State();

    constructor(page?:string)
    {
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
        if (typeof page === 'string')
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }

        Framework.parse(this,page);
        this.state.page = page;
    }

    public close() : boolean
    {
        this.canvas.close();
        return(true);
    }
}