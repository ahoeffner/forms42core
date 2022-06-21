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
import { DataModel } from './DataModel.js';
import { Logger, Type } from '../application/Logger.js';
import { Form as InterfaceForm } from '../public/Form.js';
import { EventType } from '../control/events/EventType.js';
import { FormEvents, FormEvent } from "../control/events/FormEvents.js";


export class Form
{
	private static current$:InterfaceForm = null;

	private static models:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	public static async setForm(form:Form) : Promise<boolean>
	{
		if (Form.current$ == null)
		{
			Form.current$ = form.intfrm;
			return(FormEvents.raise(FormEvent.newFormEvent(EventType.PreForm,form.intfrm)));
		}
		else
		{
			if (form.intfrm == Form.current$)
				return(true);

			if (!await FormEvents.raise(FormEvent.newFormEvent(EventType.PostForm,Form.current$)))
				return(false);

			Form.current$ = form.intfrm;
			return(FormEvents.raise(FormEvent.newFormEvent(EventType.PreForm,Form.current$)));
		}
	}

	public static drop(parent:InterfaceForm) : void
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
		let form:Form = Form.models.get(parent);

		form.linkViews();
		form.autoquery();
	}

	private block$:Block = null;
	private intfrm:InterfaceForm = null;
	private datamodel$:DataModel = new DataModel();
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:InterfaceForm)
	{
		this.intfrm = parent;
		Form.models.set(parent,this);
		Logger.log(Type.formbinding,"Create modelform: "+this.intfrm.constructor.name);
	}

	public get block() : Block
	{
		return(this.block$);
	}

	public get parent() : InterfaceForm
	{
		return(this.intfrm);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public get datamodel() : DataModel
	{
		return(this.datamodel$);
	}

	public get validated() : boolean
	{
		return(this.block$.validated);
	}

	public async setCurrentBlock(block:string) : Promise<boolean>
	{
		if (!await Form.setForm(this))
			return(false);

		if (this.block$ == null)
		{
			this.block$ = this.getBlock(block);

			if (this.block$ != null)
				return(await this.fire(EventType.PreBlock,block));
		}

		if (this.block$.name == block)
			return;

		let last:Block = this.block$;
		this.block$ = this.getBlock(block);

		let cont:boolean = true;
		if (last != null) cont = await last.validateRecord();

		if (cont)
		{
			if (!await this.fire(EventType.PostBlock,last.name))
				return(false);

			if (!await this.fire(EventType.PreBlock,block))
				return(false);
		}

		return(cont);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		this.datamodel$.setWrapper(block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.intfrm.constructor.name);
	}

	private autoquery() : void
	{
		this.blocks.forEach((block) =>
		{
			if (!block.isLinked())
				block.executequery();
		});
	}

	private linkViews() : void
	{
		this.blocks.forEach((blk) => {blk.linkView()})
	}

	private unlinkViews() : void
	{
		this.blocks.forEach((blk) => {blk.unlinkView()})
	}

	public async fire(type:EventType, block:string) : Promise<boolean>
	{
		let frmevent:FormEvent = FormEvent.newBlockEvent(type,this.intfrm,block)
		return(FormEvents.raise(frmevent));
	}
}