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

import { Form } from "../public/Form.js";
import { isClass } from "../types/Class.js";
import { BlockSource } from "./annotations/datasource.js";

export class FormMetaData
{
	private static metadata:Map<Form,FormMetaData> =
		new Map<Form,FormMetaData>();

	public static get(form:Form, create?:boolean) : FormMetaData
	{
		let meta:FormMetaData = FormMetaData.metadata.get(form);

		if (meta == null && create)
		{
			meta = new FormMetaData();
			FormMetaData.metadata.set(form,meta);
		}

		return(meta)
	}

	private blocksources$:Map<Form,BlockSource[]> =
		new Map<Form,BlockSource[]>();

	public getDataSourceAttributes(form:Form) : BlockSource[]
	{
		let prepared:BlockSource[] = [];
		let sources:BlockSource[] = this.blocksources$.get(form);

		if (sources != null)
		{
			for (let i = 0; i < sources.length; i++)
			{
				let source:any = sources[i].source;
				if (!isClass(source)) prepared.push(source);
				else						 prepared.push(new source())
			}
		}

		return(prepared);
	}

	public addDataSourceAttribute(form:Form, source:BlockSource) : void
	{
		let sources:BlockSource[] = this.blocksources$.get(form);

		if (sources == null)
		{
			sources = [];
			this.blocksources$.set(form,sources);
		}

		sources.push(source);
	}
}