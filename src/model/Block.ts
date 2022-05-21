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
import { Form as ViewForm } from "../view/Form.js";
import { Block as ViewBlock } from '../view/Block.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { EventType } from "../control/events/EventType.js";
import { Block as InterfaceBlock } from '../public/Block.js';
import { FormEvents, FormEvent } from "../control/events/FormEvents.js";


export class Block
{
	public static create(form:Form|ViewForm, block:InterfaceBlock|ViewBlock) : Block
	{
		if (form instanceof ViewForm)
			form = Form.getForm(form.parent);

		let blk:Block = form.getBlock(block.name);

		if (blk == null)
			blk = new Block(form,block.name);

		if (block instanceof InterfaceBlock)
			blk.link(block);

		return(blk);
	}

	private form:Form = null;
	private record$:number = 0;
	private name$:string = null;
	private vwblk:ViewBlock = null;
	private intfrm:InterfaceForm = null;
	private intblk:InterfaceBlock = null;

	private constructor(form:Form, name:string)
	{
		this.form = form;
		this.name$ = name;
		this.form.addBlock(this);
		this.intfrm = form.parent;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public get validated() : boolean
	{
		return(this.vwblk.validated);
	}

	public async validateRecord() : Promise<boolean>
	{
		let cont:boolean = await this.fire(EventType.ValidateRecord);
		return(cont);
	}

	public async setCurrentRecord(delta:number) : Promise<boolean>
	{
		let cont:boolean = false;
		let next:number = this.record$ + delta;

		if (next >= 0 && next <= 2) cont = true;
		if (cont) this.record$ += delta;

		return(cont);
	}

	public get record() : number
	{
		return(this.record$);
	}

	public link(block:InterfaceBlock) : void
	{
		this.intblk = block;
	}

	public linkView() : void
	{
		this.vwblk = ViewForm.getForm(this.form.parent).getBlock(this.name);
	}

	public unlinkView() : void
	{
		this.vwblk = null;
	}

	public isLinked() : boolean
	{
		return(this.intblk != null);
	}

	private async fire(type:EventType, field?:string) : Promise<boolean>
	{
		let event:FormEvent = FormEvent.newFieldEvent(type,this.intfrm,this.name,field)
		return(FormEvents.raise(event));
	}
}