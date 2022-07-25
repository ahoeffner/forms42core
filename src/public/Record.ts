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

import { Row } from "../view/Row.js";
import { Block } from "../model/Block.js";
import { Field } from "../view/fields/Field.js";
import { Record as Internal } from "../model/Record.js"

export class Record
{
	private rec$:Internal = null;

	constructor(rec:Internal)
	{
		this.rec$ = rec;
	}

	public getValue(field:string, dirty?:boolean) : any
	{
		field = field?.toLowerCase();
		let blk:Block = this.rec$.block;
		if (dirty == null) dirty = false;

		if (this.rec$.block?.eventTransaction.active)
			return(blk.eventTransaction.getValue(blk,field));

		if (dirty)
		{

			let fld:Field = blk.view.getField(field);
			if (fld != null) return(blk.getValue(field));
		}

		return(blk?.getValue(field));
	}

	public setValue(field:string, value:any) : void
	{
		field = field?.toLowerCase();
		let blk:Block = this.rec$.block;

		if (blk?.eventTransaction.active)
		{
			this.rec$.block.eventTransaction.setValue(blk,field,value);
		}
		else
		{
			this.rec$.setValue(field,value);
			let row:Row = blk?.view.displayed(this.rec$);
			if (row != null) row.getField(field)?.setValue(value);
		}
	}
}