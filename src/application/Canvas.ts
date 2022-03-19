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

import { Properties } from './Properties.js';
import { CanvasComponent } from './CanvasComponent.js';
import { Canvas as CanvasDefinition } from './interfaces/Canvas.js';

export class Canvas implements CanvasDefinition, EventListenerObject
{
    private depth:number = 0;
    private active:Element = null;
    private modal:HTMLDivElement = null;
    private canvas:HTMLDivElement = null;
    private content:HTMLDivElement = null;
    private component:CanvasComponent = null;

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

    public getComponent(): CanvasComponent
    {
        return(this.component);
    }

    public setComponent(component:CanvasComponent) : void
    {
        this.component = component;
        let page = component.getPage();

        let layout:string = Properties.CanvasProperties.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;

        this.modal = template.content.querySelector("[name=modal]");
        this.canvas = template.content.querySelector("[name=canvas]");
        this.content = template.content.querySelector("[name=content]");

        this.modal.classList.value = Properties.CanvasProperties.ModalClasses;
        this.canvas.classList.value = Properties.CanvasProperties.CanvasClasses;
        this.content.classList.value = Properties.CanvasProperties.ContentClasses;

        this.modal.style.cssText = Properties.CanvasProperties.ModalStyle;
        this.canvas.style.cssText = Properties.CanvasProperties.CanvasStyle;
        this.content.style.cssText = Properties.CanvasProperties.ContentStyle;

        this.content.style.zIndex = (2*this.depth)+"";
        this.modal.style.zIndex = (2*this.depth + 1)+"";

        if (typeof page === 'string')
        {
            template.innerHTML = page as string;
            page = template.content.getRootNode() as Element;
        }

        this.content.appendChild(page);
        this.canvas.addEventListener("mousedown",(event) => {this.dragstart(event)});
    }

    public close() : void
    {
        this.canvas.remove();
    }

    public block() : void
    {
        this.canvas.style.resize = "none";
        this.active = document.activeElement;
        this.modal.style.width = this.canvas.offsetWidth+"px";
        this.modal.style.height = this.canvas.offsetHeight+"px";
        if (this.active instanceof HTMLElement) this.active.blur();
    }

    public unblock() : void
    {
        this.modal.style.width = "0";
        this.modal.style.height = "0";
        this.canvas.style.resize = "both";
        if (this.active instanceof HTMLElement) this.active.focus();
    }

    public getPage() : Element
    {
        return(this.canvas);
    }


    /*
     * Drag code
     */

    private move = false;
    private mouse = {x: 0, y: 0};

    private dragstart(event:any) : void
    {
        if (event.target != this.content && event.target != this.canvas)
        {
            if (!event.target.classList.contains(Properties.CanvasProperties.CanvasHandleClass))
                return;
        }

        let corner =
        {
            x: +this.canvas.offsetLeft + +this.canvas.offsetWidth,
            y: +this.canvas.offsetTop + +this.canvas.offsetHeight
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

            let offX:number = event.clientX - this.mouse.x;
            let offY:number = event.clientY - this.mouse.y;

            let elemY:number = this.canvas.offsetTop;
            let elemX:number = this.canvas.offsetLeft;

            let posX:number = elemX + offX;
            let posY:number = elemY + offY;

            this.canvas.style.top = posY + "px";
            this.canvas.style.left = posX + "px";

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