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
import { Form as Model } from '../model/Form.js';
import { Form as Interface } from '../public/Form.js';
import { Logger, Type } from '../application/Logger.js';

export class Form
{
	private static views:Map<Interface,Form> =
		new Map<Interface,Form>();

	public static clear(parent:Interface) : void
	{
		Form.views.delete(parent);
		Form.getForm(parent);
	}

	public static getForm(parent:Interface) : Form
	{
		let frm:Form = Form.views.get(parent);

		if (frm == null)
			frm = new Form(parent);

		return(frm);
	}

	public static finalize(parent:Interface) : void
	{
		let form:Form = Form.views.get(parent);
		form.blocks.forEach((blk) => {blk.finalize();});
		form.linkModels();
	}

	private model$:Model = null;
	private parent$:Interface = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:Interface)
	{
		this.parent$ = parent;
		Form.views.set(parent,this);
		Logger.log(Type.formbinding,"Create viewform: "+this.parent$.constructor.name);
	}

	public get parent() : Interface
	{
		return(this.parent$);
	}

	public getBlock(name:string) : Block
	{
		return(this.blocks.get(name));
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to viewform: "+this.parent$.constructor.name);
	}

	private linkModels() : void
	{
		this.model$ = Model.getForm(this.parent);
		this.blocks.forEach((blk) => {blk.linkModel();});
	}
}