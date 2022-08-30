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

import { Logger, Type } from '../Logger.js';
import { Form } from '../../public/Form.js';
import { Class } from '../../types/Class.js';
import { FormMetaData } from '../FormMetaData.js';
import { DataSource } from '../../model/interfaces/DataSource.js';

export class BlockSource
{
	constructor
	(
		public attr:string,
		public source:Class<DataSource>|DataSource
	)
	{};
}

export const datasource = (source:Class<DataSource>|DataSource) =>
{
	function define(form:Form, attr:string)
	{
		let blksrc:BlockSource = new BlockSource(attr,source);
		FormMetaData.get(form,true).addDataSourceAttribute(form,blksrc);
		Logger.log(Type.metadata,"Setting datasource for "+form.name+"."+attr);
	}

	return(define);
}
