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
import { Block } from "./Block";
import { Record } from "../model/Record.js";
import { FieldProperties } from "../public/FieldProperties.js";

export class RecordProperties
{
	private block:Block = null;

	// record -> field -> clazz -> props
	propmap$:Map<object,Map<string,Map<string,FieldProperties>>> =
		new Map<object,Map<string,Map<string,FieldProperties>>>();

	constructor(block:Block)
	{
		this.block = block;
	}

	public clear() : void
	{
		this.propmap$.clear();
	}

	public get(record:Record, field:string, clazz:string) : FieldProperties
	{
		return(this.propmap$.get(record.id)?.get(field)?.get(clazz));

	}

	public set(record:Record, field:string, clazz:string, props:FieldProperties) : void
	{
		let rmap:Map<string,Map<string,FieldProperties>> = this.propmap$.get(record.id);

		if (rmap == null)
		{
			rmap = new Map<string,Map<string,FieldProperties>>();
			this.propmap$.set(record.id,rmap);
		}

		let fmap:Map<string,FieldProperties> = rmap.get(field);

		if (fmap == null)
		{
			fmap = new Map<string,FieldProperties>();
			rmap.set(field,fmap);
		}

		fmap.set(clazz,props);
	}

	public apply(row:Row, record:Record) : void
	{
		let rmap:Map<string,Map<string,FieldProperties>> = this.propmap$.get(record.id);
		if (rmap == null) return;

		row.getFields().forEach((fld) =>
		{
			let fmap:Map<string,FieldProperties> = rmap.get(fld.name);

			if (fmap != null)
			{
				let classes:string[] = [...fmap.keys()];

				fld.getInstances().forEach((inst) =>
				{
					for (let i = 0; i < classes.length; i++)
					{
						null;
					}
				})
			}
		});
	}
}
