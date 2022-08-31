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
import { Class, isClass } from '../types/Class.js';
import { DataSource } from '../model/interfaces/DataSource.js';


export class BlockSource
{
	constructor
	(
		public block:string,
		public source:Class<DataSource>|DataSource
	)
	{};
}


export class FormMetaData
{
	private static metadata:Map<string,FormMetaData> =
		new Map<string,FormMetaData>();

	public static get(form:Class<Form>|string, create?:boolean) : FormMetaData
	{
		if (!(typeof form === "string")) form = form.name;
		let meta:FormMetaData = FormMetaData.metadata.get(form);

		if (meta == null && create)
		{
			meta = new FormMetaData();
			FormMetaData.metadata.set(form,meta);
		}

		return(meta)
	}

	private blocksources$:Map<string,BlockSource[]> =
		new Map<string,BlockSource[]>();

	public getDataSourceAttributes(form:Form) : BlockSource[]
	{
		let prepared:BlockSource[] = [];
		let name:string = form.constructor.name;
		let sources:BlockSource[] = this.blocksources$.get(name);

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

	public addDataSourceAttribute(form:Class<Form>|string, source:BlockSource) : void
	{
		if (!(typeof form === "string")) form = form.name;
		let sources:BlockSource[] = this.blocksources$.get(form);

		if (sources == null)
		{
			sources = [];
			this.blocksources$.set(form,sources);
		}

		sources.push(source);
	}
}