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
import { Field } from "../view/fields/Field.js";
import { FieldProperties } from "./FieldProperties.js";
import { Record as Internal } from "../model/Record.js";
import { Block as ModelBlock } from "../model/Block.js";

export class Record
{
	private rec$:Internal = null;

	constructor(rec:Internal)
	{
		this.rec$ = rec;
	}

	public getValue(field:string) : any
	{
		field = field?.toLowerCase();
		let blk:ModelBlock = this.rec$.block;
		let row:Row = blk?.view.displayed(this.rec$);

		let fld:Field = row?.getField(field);
		if (fld != null) return(fld.getValue());

		return(this.rec$.getValue(field));
	}

	public setValue(field:string, value:any) : void
	{
		field = field?.toLowerCase();
		this.rec$.setValue(field,value);
		let blk:ModelBlock = this.rec$.block;
		let row:Row = blk?.view.displayed(this.rec$);
		if (row != null) row.getField(field)?.setValue(value);
	}

	public setProperties(props:FieldProperties, field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		let blk:ModelBlock = this.rec$.block;
		blk.view.setRecordProperties(this.rec$,field,clazz,props);
	}

	public clearProperties(field:string, clazz?:string) : void
	{
		field = field?.toLowerCase();
		clazz = clazz?.toLowerCase();
		let blk:ModelBlock = this.rec$.block;
		blk.view.setRecordProperties(this.rec$,field,clazz,null);
	}
}