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
import { Form as Interface } from '../public/Form.js';

export class Form
{
	private blocks:Map<string,Block> =
		new Map<string,Block>();

	private static viewmap:Map<Interface,Form> =
		new Map<Interface,Form>();

	public static clear(form:Interface) : void
	{
		Form.viewmap.delete(form);
	}

	public static create(form:Interface) : Form
	{
		let frm:Form = Form.viewmap.get(form);

		if (frm == null)
		{
			frm = new Form();
			Form.viewmap.set(form,frm);
		}

		return(frm);
	}

	public get(name:string) : Block
	{
		return(this.blocks.get(name.toLowerCase()));
	}

	public addBlock(block:Block) : void
	{
		this.blocks.set(block.name,block);
	}
}