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

import { Row } from "./Row.js";
import { Form } from "../../public/Form.js";


export class Block
{
	private static map:Map<Form,Map<string,Block>> =
		new Map<Form,Map<string,Block>>();

	private rows:Map<number,Row> = new Map<number,Row>();


	public static get(form:Form, block:string, create:boolean) : Block
	{
		block = block.toLowerCase();
		let blkmap:Map<string,Block> = Block.map.get(form);

		if (blkmap == null)
		{
			if (!create) return(null);
			blkmap = new Map<string,Block>();
			Block.map.set(form,blkmap);
		}

		let blk:Block = blkmap.get(block);

		if (blk == null && create)
		{
			blk = new Block();
			blkmap.set(block,blk);
		}

		return(blk);
	}

	public getRow(row:number, create:boolean) : Row
	{
		let rec:Row = this.rows.get(row);

		if (rec == null)
		{
			rec = new Row();
			if (create) this.rows.set(row,rec);
		}

		return(rec);
	}
}
