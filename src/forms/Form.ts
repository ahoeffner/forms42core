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

export class Form
{
    private page$:Element = null;
    private navigable$:boolean = true;

    constructor(page?:string)
    {
        this.setPage(page);
    }

    public get navigable() : boolean
    {
        return(this.navigable$);
    }

    public set navigable(navigable:boolean)
    {
        this.navigable$ = navigable;
    }

    public setPage(page:string|Element)
    {
        if (!(page instanceof Element))
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }
        this.page$ = page;
    }

    public getPage() : Element
    {
        return(this.page$);
    }
}