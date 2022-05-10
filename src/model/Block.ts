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
import { Block as View } from '../view/Block.js';
import { Block as Interface } from '../public/Block.js';


export class Block
{
	public static create(form:Form, block:Interface|View) : Block
	{
		let blk:Block = form.getBlock(block.name);

		if (blk == null)
			blk = new Block(form,block.name);

		blk.link(block);
		return(blk);
	}

	private form:Form = null;
	private view:View = null;
	private name$:string = null;
	private intf:Interface = null;

	private constructor(form:Form, name:string)
	{
		this.form = form;
		this.name$ = name;
		this.form.addBlock(this);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public link(block:Interface|View) : void
	{
		if (block instanceof View) this.view = block;
		else					   this.intf = block;
	}

	public isLinked() : boolean
	{
		return(this.intf != null);
	}

	public clearViewLink() : void
	{
		this.view = null;
	}
}