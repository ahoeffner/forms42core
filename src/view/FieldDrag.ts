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

import { Form } from "./Form.js";
import { Block } from "./Block.js";
import { FieldInstance } from "./fields/FieldInstance";

export class FieldDrag implements EventListenerObject
{
	private cursor:string = null;
	private target:HTMLElement = null;
	private instance:FieldInstance = null;

	constructor(private form:Form, private header:HTMLElement)
	{
		this.cursor = header.style.cursor;
		this.instance = this.findInstance(header);

		if (this.instance != null)
		{
			this.header.style.cursor = "auto";
			document.addEventListener("drag",this);
			document.addEventListener("dragend",this);
			document.addEventListener("dragover",this);
			document.addEventListener("dragleave",this);
		}
	}


	public handleEvent(event:MouseEvent): void
	{
		if (event.type == "dragend")
		{
			this.header.style.cursor = this.cursor;

			document.removeEventListener("drag",this);
			document.removeEventListener("dragend",this);
			document.removeEventListener("dragover",this);
			document.removeEventListener("dragleave",this);

			this.move();
		}

		if (event.type == "dragleave")
		{
			this.header.style.cursor = "auto";
		}

		if (event.type == "dragover")
		{
			this.target = null;

			if (event.target instanceof HTMLElement)
			{
				if (this.check(event.target))
				{
					this.target = event.target;
					this.header.style.cursor = "move";
				}
			}
		}
	}

	private move() : void
	{
		let target:FieldInstance = this.findInstance(this.target);

		if (target && target != this.instance)
		{
			let h1:HTMLElement = document.createElement("p");
			let h2:HTMLElement = document.createElement("p");

			this.target.replaceWith(h1);
			this.header.replaceWith(h2);

			h1.replaceWith(this.header);
			h2.replaceWith(this.target);
		}
	}

	private check(header:HTMLElement) : boolean
	{
		let id:string = header.getAttribute("for");
		if (id == null) return(false);

		let elem:HTMLElement = document.querySelector("#"+id);
		if (elem == null) return(false);

		let block:Block = this.instance.field.block;
		let instances:FieldInstance[] = block.getFieldInstances(true);

		for (let i = 0; i < instances.length; i++)
		{
			if (instances[i].element == elem)
				return(true);
		}

		return(false);
	}

	private findInstance(header:HTMLElement) : FieldInstance
	{
		let id:string = header.getAttribute("for");
		if (id == null) return(null);

		let elem:HTMLElement = document.querySelector("#"+id);
		if (elem == null) return(null);

		let blocks:Block[] = this.form.getBlocks();

		for (let b = 0; b < blocks.length; b++)
		{
			let instances:FieldInstance[] = blocks[b].getFieldInstances(true);

			for (let i = 0; i < instances.length; i++)
			{
				if (instances[i].element == elem)
					return(instances[i])
			}
		}

		return(null);
	}
}