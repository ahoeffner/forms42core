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

import { Block } from './Block.js';
import { Form as ViewForm } from '../view/Form.js';
import { Logger, Type } from '../application/Logger.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { EventType } from '../control/events/EventType.js';
import { FormEvents, FormEvent } from "../control/events/FormEvents.js";


export class Form
{
	private static models:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	public static clear(parent:InterfaceForm) : void
	{
		let remove:string[] = [];
		let form:Form = Form.models.get(parent);

		form.unlinkViews();

		form.blocks.forEach((blk) =>
		{
			if (!blk.isLinked())
				remove.push(blk.name);
		});

		remove.forEach((name) => {form.blocks.delete(name)});
	}

	public static getForm(parent:InterfaceForm) : Form
	{
		let frm:Form = Form.models.get(parent);

		if (frm == null)
			frm = new Form(parent);

		return(frm);
	}

	public static finalize(parent:InterfaceForm) : void
	{
		Form.models.get(parent).linkViews();
	}

	private vwform:ViewForm = null;
	private current_block$:Block = null;
	private intfrm:InterfaceForm = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:InterfaceForm)
	{
		this.intfrm = parent;
		Form.models.set(parent,this);
		Logger.log(Type.formbinding,"Create modelform: "+this.intfrm.constructor.name);
	}

	public get parent() : InterfaceForm
	{
		return(this.intfrm);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public async setCurrentBlock(block:string) : Promise<boolean>
	{
		if (this.current_block$.name == block)
			return;

		let last:Block = this.current_block$;
		this.current_block$ = this.getBlock(block);

		let cont:boolean = true;
		if (last != null) cont = await last.validateRecord();

		return(cont);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.intfrm.constructor.name);
	}

	private linkViews() : void
	{
		this.vwform = ViewForm.getForm(this.parent);
		this.blocks.forEach((blk) => {blk.linkView()})
	}

	private unlinkViews() : void
	{
		this.vwform = ViewForm.getForm(this.parent);
		this.blocks.forEach((blk) => {blk.unlinkView()})
	}

	private async fire(type:EventType, block?:string) : Promise<boolean>
	{
		let event:FormEvent = FormEvent.newFieldEvent(type,this.intfrm,block,null)
		return(FormEvents.raise(event));
	}
}