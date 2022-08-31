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


export class FormMetaData
{
	private static metadata:Map<string,FormMetaData> =
		new Map<string,FormMetaData>();

	public static get(form:Class<Form>|Form, create?:boolean) : FormMetaData
	{
		let name:string = null;

		if (isClass(form)) name = form.name;
		else					 name = form.constructor.name;

		let meta:FormMetaData = FormMetaData.metadata.get(name);

		if (meta == null && create)
		{
			meta = new FormMetaData();
			FormMetaData.metadata.set(name,meta);
		}

		return(meta)
	}

	public blockattrs:Map<string,string> =
		new Map<string,string>();

	private blocksources$:Map<string,Class<DataSource>|DataSource> =
		new Map<string,Class<DataSource>|DataSource>();

	public getDataSources() : Map<string,DataSource>
	{
		let sources:Map<string,DataSource> =
			new Map<string,DataSource>();

		this.blocksources$.forEach((source,block) =>
		{
			if (!isClass(source)) sources.set(block,source);
			else						 sources.set(block, new source());
		})

		return(sources);
	}

	public addDataSource(block:string, source:Class<DataSource>|DataSource) : void
	{
		this.blocksources$.set(block,source);
	}
}