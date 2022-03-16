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

import { Properties } from "./Properties";
import { WindowComponent } from "./WindowComponent";
import { Window as WindowDefinition } from "./interfaces/Window";

export class Window implements WindowDefinition, EventListenerObject
{
    private depth:number = 0;
    private active:Element = null;
    private modal:HTMLDivElement = null;
    private window:HTMLDivElement = null;
    private content:HTMLDivElement = null;
    private component:WindowComponent = null;

    public getDepth(): number
    {
        return(this.depth);
    }

    public setDepth(depth:number) : void
    {
        this.depth = depth;

        if (this.content != null && this.modal != null)
        {
            this.content.style.zIndex = (2*depth)+"";
            this.modal.style.zIndex = (2*depth + 1)+"";
        }
    }

    public getComponent(): WindowComponent
    {
        return(this.component);
    }

    public setComponent(component:WindowComponent) : void
    {
        this.component = component;
        let page = component.getPage();

        let layout:string = Properties.Window.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;

        this.modal = template.content.querySelector("[name=modal]");
        this.window = template.content.querySelector("[name=window]");
        this.content = template.content.querySelector("[name=content]");

        this.modal.classList.value = Properties.Window.modalClasses;
        this.window.classList.value = Properties.Window.windowClasses;
        this.content.classList.value = Properties.Window.contentClasses;

        this.modal.style.cssText = Properties.Window.modalStyle;
        this.window.style.cssText = Properties.Window.windowStyle;
        this.content.style.cssText = Properties.Window.contentStyle;

        this.content.style.zIndex = (2*this.depth)+"";
        this.modal.style.zIndex = (2*this.depth + 1)+"";

        if (typeof page === 'string')
        {
            template.innerHTML = page as string;
            page = template.content.getRootNode() as Element;
        }

        this.content.appendChild(page);
        this.window.addEventListener("mousedown",(event) => {this.dragstart(event)});
    }

    public close(): boolean
    {
        if (this.component.close())
        {
            this.window.remove();
            return(true);
        }

        return(false);
    }

    public block() : void
    {
        this.window.style.resize = "none";
        this.active = document.activeElement;
        this.modal.style.width = this.window.offsetWidth+"px";
        this.modal.style.height = this.window.offsetHeight+"px";
        if (this.active instanceof HTMLElement) this.active.blur();
    }

    public unblock() : void
    {
        this.modal.style.width = "0";
        this.modal.style.height = "0";
        this.window.style.resize = "both";
        if (this.active instanceof HTMLElement) this.active.focus();
    }

    public getPage() : Element
    {
        return(this.window);
    }


    /*
     * Drag code
     */

    private move = false;
    private mouse = {x: 0, y: 0};

    private dragstart(event:any) : void
    {
        if (event.target != this.content && event.target != this.window)
            return;

        let corner =
        {
            x: +this.window.offsetLeft + +this.window.offsetWidth,
            y: +this.window.offsetTop + +this.window.offsetHeight
        }

        let pos = {x: +event.clientX, y: +event.clientY};

        if (corner.x - pos.x < 16 && corner.y - pos.y < 16)
            return;

        this.move = true;

        document.addEventListener('mouseup',this);
        document.addEventListener('mousemove',this);

        this.mouse = {x: event.clientX, y: event.clientY};
    }

    public drag(event:any) : void
    {
        if (this.move)
        {
            event.preventDefault();

            var offX = event.clientX - this.mouse.x;
            var offY = event.clientY - this.mouse.y;

            var elemY = this.window.offsetTop;
            var elemX = this.window.offsetLeft;

            var posX = elemX + offX;
            var posY = elemY + offY;

            this.window.style.top = posY + "px";
            this.window.style.left = posX + "px";

            this.mouse = {x: event.clientX, y: event.clientY};
        }
    }

    private dragend(event:any) : void
    {
        this.move = false;
        document.removeEventListener('mouseup',this);
        document.removeEventListener('mousemove',this);
    }

    public handleEvent(event:Event) : void
    {
        if (event.type == "mouseup") this.dragend(event);
        if (event.type == "mousemove") this.drag(event);
    }
}