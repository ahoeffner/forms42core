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

import { FieldInstance } from './FieldInstance.js';
import { Field as ViewField } from '../view/fields/Field.js';

export class Field
{
	constructor(private fld:ViewField) {}

	public getInstances() : FieldInstance[]
	{
		let instances:FieldInstance[] = [];

		this.fld.getInstances().forEach((inst) =>
		{instances.push(new FieldInstance(inst))});

		return(instances);
	}

	public getInstancesByClass(clazz:string) : FieldInstance[]
	{
		clazz = clazz?.toLowerCase();
		let instances:FieldInstance[] = [];

		this.fld.getInstancesByClass(clazz).forEach((inst) =>
		{instances.push(new FieldInstance(inst))});

		return(instances);
	}
}