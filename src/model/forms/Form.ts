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

import { Block } from '../blocks/Block.js';
import { Form as Interface} from '../../public/Form.js';
import { Logger, Type } from '../../application/Logger.js';

export class Form
{
	private static models:Map<Interface,Form> =
		new Map<Interface,Form>();

	private parent:Interface = null;
	private blocks:Map<string,Block> = new Map<string,Block>();

	public static create(form:Interface) : Form
	{
		let frm:Form = Form.models.get(form);

		if (frm == null)
		{
			frm = new Form(form);
			Form.models.set(form,frm);
		}

		return(frm);
	}

	private constructor(parent:Interface)
	{
		this.parent = parent;
		Form.models.set(parent,this);
		Logger.log(Type.formbinding,"Create form: "+this.parent.constructor.name);
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
		Logger.log(Type.formbinding,"Add block '"+block.name+"' to form: "+this.parent.constructor.name);
	}
}