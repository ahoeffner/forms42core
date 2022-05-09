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

import { Row } from "../blocks/Row.js";
import { Block } from "../blocks/Block.js";
import { Form } from "../../public/Form.js";
import { FieldInstance } from "./FieldInstance.js";

export class Field
{
	public static get(form:Form, block:string, rownum:number, field:string, create:boolean) : Field
	{
		let blk:Block = Block.get(form,block,create);
		let row:Row = blk.getRow(rownum,create);
		return(row.getField(field,create));
	}

	private name$:string = null;
	private instances:FieldInstance[] = [];

	constructor(name:string)
	{
		this.name$ = name;
	}

	public get name() : string
	{
		return(this.name$);
	}

	public add(instance:FieldInstance) : void
	{
		this.instances.push(instance);
	}
}