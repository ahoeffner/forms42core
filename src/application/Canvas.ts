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
import { Canvas as CanvasDefinition, View } from './interfaces/Canvas.js';


export class Canvas implements CanvasDefinition, EventListenerObject
{
    private zindex$:number = 0;
    private active:Element = null;
    private content:HTMLElement = null;
    private modal:HTMLDivElement = null;
    private canvas:HTMLDivElement = null;
    private container:HTMLDivElement = null;
    private component:CanvasComponent = null;

    public close() : void
    {
        this.canvas.remove();
    }

    public getElement() : HTMLElement
    {
        return(this.canvas);
    }

    public getContent() : HTMLElement
    {
        return(this.content);
    }

    public getComponent(): CanvasComponent
    {
        return(this.component);
    }

    public getElementById(id:string) : HTMLElement
    {
        return(this.content.querySelector("#"+id));
    }

    public getElementByName(name:string) : HTMLElement[]
    {
        let elements:HTMLElement[] = [];
        let list:NodeListOf<HTMLElement> = this.content.querySelectorAll("[name='"+name+"']");

        list.forEach((element) => {elements.push(element)});
        return(elements);
    }

    public setComponent(component:CanvasComponent) : void
    {
        this.component = component;
        let page = component.getPage();
        let root:HTMLDivElement = document.createElement("div");

        let layout:string = Properties.CanvasProperties.page;
        let template:HTMLTemplateElement = document.createElement("template");

        template.innerHTML = layout;

        this.modal = template.content.querySelector("[name=modal]");
        this.canvas = template.content.querySelector("[name=canvas]");
        this.container = template.content.querySelector("[name=content]");

        this.modal.classList.value = Properties.CanvasProperties.ModalClasses;
        this.canvas.classList.value = Properties.CanvasProperties.CanvasClasses;
        this.container.classList.value = Properties.CanvasProperties.ContentClasses;

        this.modal.style.cssText = Properties.CanvasProperties.ModalStyle;
        this.canvas.style.cssText = Properties.CanvasProperties.CanvasStyle;
        this.container.style.cssText = Properties.CanvasProperties.ContentStyle;

        this.container.style.zIndex = (2*this.zindex$)+"";
        this.modal.style.zIndex = (2*this.zindex$ + 1)+"";

        if (typeof page === 'string')
        {
            template.innerHTML = page as string;
            page = template.content.getRootNode() as Element;
        }

        root.appendChild(page);
        this.container.appendChild(root);
        this.content = this.container.firstChild as HTMLElement;
        this.canvas.addEventListener("mousedown",(event) => {this.dragstart(event)});
    }

    public block() : void
    {
        this.canvas.style.resize = "none";
        this.active = document.activeElement as Element;
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

    public getView() : View
    {
        return({
            y: this.canvas.offsetTop,
            x: this.canvas.offsetLeft,
            width: this.canvas.offsetWidth,
            height: this.canvas.offsetHeight
        });
    }

    public getParentView() : View
    {
        return({
            y: this.canvas.parentElement.offsetTop,
            x: this.canvas.parentElement.offsetLeft,
            width: this.canvas.parentElement.offsetWidth,
            height: this.canvas.parentElement.offsetHeight
        });
    }

    public setView(frame:View) : void
    {
        if (typeof frame.x === "number") frame.x = frame.x + "px";
        if (typeof frame.y === "number") frame.y = frame.y + "px";
        if (typeof frame.width === "number") frame.width = frame.width + "px";
        if (typeof frame.height === "number") frame.height = frame.height + "px";

        this.canvas.style.top = frame.y;
        this.canvas.style.left = frame.x;
        this.canvas.style.width = frame.width;
        this.canvas.style.height = frame.height;
    }


    /*
     * Drag code
     */

    private move = false;
    private mouse = {x: 0, y: 0};

    private dragstart(event:any) : void
    {
        if (event.target != this.container && event.target != this.canvas)
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