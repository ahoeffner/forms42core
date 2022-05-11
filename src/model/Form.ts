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
import { Form as Interface} from '../public/Form.js';
import { Logger, Type } from '../application/Logger.js';


export class Form
{
	private static models:Map<Interface,Form> =
		new Map<Interface,Form>();

	public static clear(parent:Interface) : void
	{
		let remove:string[] = [];
		let form:Form = Form.models.get(parent);

		form.blocks.forEach((blk) =>
		{
			if (!blk.isLinked())
				remove.push(blk.name);
		});

		remove.forEach((name) => {form.blocks.delete(name)});
	}

	public static create(parent:Interface) : Form
	{
		let frm:Form = Form.models.get(parent);

		if (frm == null)
		{
			frm = new Form(parent);
			Form.models.set(parent,frm);
		}

		return(frm);
	}

	private parent$:Interface = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	private constructor(parent:Interface)
	{
		this.parent$ = parent;
		Form.models.set(parent,this);
		Logger.log(Type.formbinding,"Create modelform: "+this.parent$.constructor.name);
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
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to modelform: "+this.parent$.constructor.name);
	}
}