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
import { Block as Interface } from '../public/Block.js';


export class Block
{
	public static create(form:Form|ViewForm, block:Interface|ViewBlock) : Block
	{
		if (form instanceof ViewForm)
			form = Form.getForm(form.parent);

		let blk:Block = form.getBlock(block.name);

		if (blk == null)
			blk = new Block(form,block.name);

		if (block instanceof Interface)
			blk.link(block);

		return(blk);
	}

	private form:Form = null;
	private name$:string = null;
	private intf:Interface = null;
	private view$:ViewBlock = null;

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

	public link(block:Interface) : void
	{
		this.intf = block;
	}

	public linkView() : void
	{
		this.view$ = ViewForm.getForm(this.form.parent).getBlock(this.name);
	}

	public unlinkView() : void
	{
		this.view$ = null;
	}

	public isLinked() : boolean
	{
		return(this.intf != null);
	}
}