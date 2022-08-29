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

import { Form } from '../public/Form.js';
import { Form as ViewForm } from '../view/Form.js';
import { Form as ModelForm } from '../model/Form.js';

import { Block } from '../public/Block.js';
import { Block as ViewBlock } from '../view/Block.js';
import { Block as ModelBlock } from '../model/Block.js';

export class FormBacking
{
	private static vforms:Map<Form,ViewForm> =
		new Map<Form,ViewForm>();

	private static mforms:Map<Form,ModelForm> =
		new Map<Form,ModelForm>();

	private static bdata:Map<Form,FormBacking> =
		new Map<Form,FormBacking>();

	public static getBacking(form:Form) : FormBacking
	{
		return(FormBacking.bdata.get(form));
	}

	public static getViewForm(form:Form) : ViewForm
	{
		return(FormBacking.vforms.get(form));
	}

	public static setViewForm(form:Form, view:ViewForm) : void
	{
		FormBacking.vforms.set(form,view);
	}

	public static getModelForm(form:Form) : ModelForm
	{
		return(FormBacking.mforms.get(form));
	}

	public static setModelForm(form:Form, model:ModelForm) : void
	{
		FormBacking.mforms.set(form,model);
	}

	public static getViewBlock(block:Block|ModelBlock) : ViewBlock
	{
		let form:ViewForm = null;

		if (block instanceof Block) form = FormBacking.vforms.get(block.form);
		else 								 form = FormBacking.vforms.get(block.form.parent);

		return(form.getBlock(block.name));
	}

	public static getModelBlock(block:Block|ViewBlock) : ModelBlock
	{
		let form:ModelForm = null;

		if (block instanceof Block) form = FormBacking.mforms.get(block.form);
		else 								 form = FormBacking.mforms.get(block.form.parent);

		return(form.getBlock(block.name));
	}


	public page:string|HTMLElement = null;

	constructor(form:Form)
	{
		FormBacking.bdata.set(form,this);
	}
}