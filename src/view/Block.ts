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
import { Form } from "./Form.js";
import { Block as Model } from '../model/Block.js';
import { Form as Interface } from '../public/Form.js';


export class Block
{
	private form:Form = null;
	private name$:string = null;
	private rows:Map<number,Row> = new Map<number,Row>();

	constructor(form:Interface,name:string)
	{
		if (name == null) name = "";
		this.form = Form.create(form);
		this.name$ = name.toLowerCase();
		Model.create(Form.create(form),this);
	}

	public get name() : string
	{
		return(this.name$);
	}

	public addRow(row:Row) : void
	{
		this.rows.set(row.rownum,row);
	}

	public getRow(rownum:number) : Row
	{
		return(this.rows.get(rownum));
	}
}
