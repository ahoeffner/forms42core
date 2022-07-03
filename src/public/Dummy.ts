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
import { Block } from './Block.js';
import { Form as View } from '../view/Form.js';
import { FieldInstance } from './FieldInstance.js';
import { Field as ViewField } from '../view/fields/Field.js';

export class InertField
{
	private fields$:ViewField[] = [];

	constructor(form:Form, block:string, field:string)
	{
		let flds:ViewField[] = View.getForm(form).getBlock(block)?.getFields(field);

	}

	public get name() : string
	{
		return(this.fields$[0].name);
	}

	public get form() : Form
	{
		return(this.fields$[0].block.form.parent);
	}

	public getInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.fields$.forEach((field) =>
		{
			field.getInstances().forEach((inst) =>
			{instances.push(new FieldInstance(inst))});
		})

		return(instances);
	}

	public getInstancesByClass(clazz:string) : FieldInstance[]
	{
		clazz = clazz?.toLowerCase();
		let instances:FieldInstance[] = [];

		this.fields$.forEach((field) =>
		{
			field.getInstancesByClass(clazz).forEach((inst) =>
			{instances.push(new FieldInstance(inst));});
		})

		return(instances);
	}
}