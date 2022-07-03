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

import { Form } from './Form.js';
import { FieldInstance as ViewInstance } from '../view/fields/FieldInstance.js';

export class Field
{
	constructor(private inst$:ViewInstance) {}

	public get name() : string
	{
		return(this.inst$.name);
	}

	public get form() : Form
	{
		return(this.inst$.form);
	}

	public getValue() : any
	{
		return(this.form.getValue(this.inst$.block,this.name));
	}

	public setValue(value:any) : void
	{
		this.form.setValue(this.inst$.block,this.name,value);
	}
}