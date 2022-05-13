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
import { Form as ModelForm } from '../model/Form.js';
import { Logger, Type } from '../application/Logger.js';
import { Form as InterfaceForm } from '../public/Form.js';

export class Form
{
	private static views:Map<InterfaceForm,Form> =
		new Map<InterfaceForm,Form>();

	public static clear(parent:InterfaceForm) : void
	{
		Form.views.delete(parent);
		Form.getForm(parent);
	}

	public static getForm(parent:InterfaceForm) : Form
	{
		let frm:Form = Form.views.get(parent);

		if (frm == null)
			frm = new Form(parent);

		return(frm);
	}

	public static finalize(parent:InterfaceForm) : void
	{
		let form:Form = Form.views.get(parent);
		form.blocks.forEach((blk) => {blk.finalize();});
		form.linkModels();
	}

	private mdlfrm:ModelForm = null;
	private current_block$:Block = null;
	private parent$:InterfaceForm = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:InterfaceForm)
	{
		this.parent$ = parent;
		Form.views.set(parent,this);
		Logger.log(Type.formbinding,"Create viewform: "+this.parent$.constructor.name);
	}

	public get parent() : InterfaceForm
	{
		return(this.parent$);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public async setCurrentBlock(block:string) : Promise<boolean>
	{
		if (this.current_block$ == null)
		{
			this.current_block$ = this.getBlock(block);
			return(true);
		}

		if (this.current_block$.name == block)
			return(true);

		let cont:boolean = await this.mdlfrm.setCurrentBlock(block);
		this.current_block$ = this.getBlock(block);

		return(cont);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to viewform: "+this.parent$.constructor.name);
	}

	private linkModels() : void
	{
		this.mdlfrm = ModelForm.getForm(this.parent);
		this.blocks.forEach((blk) => {blk.linkModel();});
	}
}