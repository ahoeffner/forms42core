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
import { Form as Interface } from '../../public/Form.js';

export class Form
{
	private static viewmap:Map<Interface,Form> = new Map<Interface,Form>();

	public static clear(form:Interface) : void
	{
		Form.viewmap.delete(form);
	}

	public static get(form:Interface, create:boolean) : Form
	{
		let frm:Form = Form.viewmap.get(form);

		if (frm == null && create)
		{
			frm = new Form();
			Form.viewmap.set(form,frm);
		}

		return(frm);
	}

	private blocks:Map<string,Block> =
		new Map<string,Block>();

	public get(name:string, create:boolean) : Block
	{
		name = name.toLowerCase();
		let block:Block = this.blocks.get(name)

		if (block == null && create)
		{
			block = new Block(name);
			this.blocks.set(block.name,block);
		}

		return(block);
	}
}