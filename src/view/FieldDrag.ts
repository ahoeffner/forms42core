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

import { Block } from "./Block.js";
import { FieldInstance } from "./fields/FieldInstance.js";

export class FieldDrag implements EventListenerObject
{
	private drag$:HTMLDivElement = null;
	private elements$:HTMLElement[] = null;
	private mouse$:{x:number, y:number} = null;
	private position$:{x:number, y:number} = null;
	private positions$:{x:number, y:number}[] = null;

	constructor(private inst:FieldInstance)
	{
		this.create();
	}

	public drag(event:MouseEvent) : void
	{
		if (this.inst.element instanceof HTMLInputElement)
			this.inst.element.setSelectionRange(0,0);

		this.mouse$ = {x: event.clientX, y: event.clientY};
	}

	public handleEvent(event:MouseEvent): void
	{
		if (event.type == "mouseup")
		{
			this.drag$.remove();
			document.removeEventListener("mouseup",this);
			document.removeEventListener("mousemove",this);
		}

		if (event.type == "mousemove")
		{
			let deltaX:number = event.clientX - this.mouse$.x;
			let deltaY:number = event.clientY - this.mouse$.y;

			this.position$.x += deltaX;
			this.position$.y += deltaY;

			this.mouse$.x = event.clientX;
			this.mouse$.y = event.clientY;

			this.drag$.style.top = this.position$.y + "px";
			this.drag$.style.left = this.position$.x + "px";
		}
	}

	private create() : void
	{
		let rect = this.findBox();
		this.drag$ = document.createElement("div");

		this.drag$.style.width = rect.w+"px";
		this.drag$.style.height = rect.h+"px";
		this.drag$.style.border = "1px dotted";
		this.drag$.style.background = "yellow";
		this.drag$.style.zIndex = "2147483647";

		document.body.appendChild(this.drag$);

		this.drag$.style.position = "absolute";
		this.drag$.style.top = rect.y + "px";
		this.drag$.style.left = rect.x + "px";

		this.addClones();
		this.position$ = {x: rect.x, y: rect.y};

		document.addEventListener("mouseup",this);
		document.addEventListener("mousemove",this);
	}

	private findBox() : {x:number, y:number, w:number, h:number}
	{
		this.positions$ = [];
		this.findElements();

		let box:{x1:number, y1:number, x2:number, y2:number} =
			{x1:Number.MAX_VALUE, y1:Number.MAX_VALUE, x2:0, y2:0};

		this.elements$.forEach((elem) =>
		{
			let rect = this.getRectangle(elem);
			this.positions$.push({x: rect.x, y: rect.y});

			if (rect.x < box.x1) box.x1 = rect.x;
			if (rect.y < box.y1) box.y1 = rect.y;

			if (rect.x + rect.w > box.x2) box.x2 = rect.x + rect.w;
			if (rect.y + rect.h > box.y2) box.y2 = rect.y + rect.h;
		})

		return({x: box.x1, y: box.y1, w: box.x2-box.x1+20, h: box.y2-box.y1+20});
	}

	private findElements() : void
	{
		this.elements$ = [];
		let rows:number = 0;
		let block:Block = this.inst.field.block;

		if (this.inst.row >= 0)
			rows = this.inst.field.block.rows;

		if (rows == 0)
		{
			this.elements$.push(this.inst.element);
		}
		else
		{
			block.getFieldInstances(true).forEach((inst) =>
			{
				if (inst.name == this.inst.name && inst.row >= 0)
					{this.elements$.push(inst.element)}
			})
		}

		let label:HTMLLabelElement = null;

		for (let i = 0; i < this.elements$.length; i++)
		{
			label = this.findLabel(this.elements$[i]);
			if (label != null)
			{
				this.elements$.unshift(label);
				break;
			}
		}
	}

	private addClones() : void
	{
		let drag:{x:number, y:number} = this.getRectangle(this.drag$);

		for (let i = 0; i < this.positions$.length; i++)
		{
			let elem:HTMLElement = this.elements$[i];
			let rect:{x:number, y:number} = this.positions$[i];

			let posX:number = rect.x-drag.x;
			let posY:number = rect.y-drag.y;

			let clone:HTMLElement = elem.cloneNode(true) as HTMLElement;
			this.drag$.appendChild(clone);

			clone.style.top = posY+"px";
			clone.style.left = posX+"px";
			clone.style.position = "absolute";
		}
	}

	private findLabel(element:HTMLElement) : HTMLLabelElement
	{
		if (element.id == null) return(null);
		return(document.querySelector("label[for="+element.id+"]"));
	}

	private getRectangle(element:HTMLElement) : {x:number, y:number, w:number, h:number}
	{
		let body:HTMLElement = document.body;
		let delem:HTMLElement = document.documentElement;
		let box:DOMRect = element.getBoundingClientRect();

		let scrollTop:number = window.pageYOffset || delem.scrollTop || body.scrollTop;
	   let scrollLeft:number = window.pageXOffset || delem.scrollLeft || body.scrollLeft;

		let clientTop:number = delem.clientTop || body.clientTop || 0;
		let clientLeft:number = delem.clientLeft || body.clientLeft || 0;

		let top:number  = box.top +  scrollTop - clientTop;
		let left:number = box.left + scrollLeft - clientLeft;

		return({x:Math.round(left), y: Math.round(top), w: element.offsetWidth, h: element.offsetHeight});
	}
}