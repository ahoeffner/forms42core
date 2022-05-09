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

import { Form } from "../forms/Form.js";
import { Block as Interface} from '../../public/Block';


export class Block
{
	private static map:Map<Form,Map<string,Block>> =
		new Map<Form,Map<string,Block>>();

	public static get(form:Form, block:string) : Block
	{
		let blkmap:Map<string,Block> = Block.map.get(form);

		if (blkmap == null) return(null);
		let blk:Block = blkmap.get(block);

		return(blk);
	}

	private form:Form = null;
	private parent:Interface = null;


	constructor(form:Form, parent:Interface)
	{
		this.form = form;
		this.parent = parent;
		this.form.addBlock(this);
	}

	public get name() : string
	{
		return(this.parent.name);
	}
}