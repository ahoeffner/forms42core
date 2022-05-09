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
import { Form as Forms } from '../model/forms/Form.js';
import { Block as Model } from '../model/blocks/Block.js';

export class Block
{
	private name$:string = null;

	constructor(form:Form, name:string)
	{
		if (name == null) name = "";
		this.name$ = name.toLowerCase();
		Model.create(Forms.create(form),this);
	}

	public get name() : string
	{
		return(this.name$);
	}
}