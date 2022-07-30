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
		let fmap:Map<string,Pattern[]> = this.propmap$.get(record.id);

		if (fmap)
		{
			for(let [clazz,pattern] of fmap)
			{
			}
		}
	}

	public set(row:Row, record:Record, field:string, clazz:string, props:FieldProperties) : void
	{
		/*
		let rmap:Map<string,FieldProperties> = this.propmap$.get(record.id);

		if (rmap == null)
		{
			rmap = new Map<string,FieldProperties>();
			this.propmap$.set(record.id,rmap);
		}

		let idx:number = row.getInstanceIndex(inst);
		let field:string = idx+";"+inst.name;
		rmap.set(field,props);
		console.log("setting props, inst: "+inst.name+"["+inst.row+"] field: "+field);
		*/
	}

	public apply(row:Row, record:Record) : void
	{
		row.getFields().forEach((fld) =>
		{
			null;
		});

		/*
		let props:FieldProperties = null;
		let rmap:Map<string,FieldProperties> = this.propmap$.get(record.id);

		if (rmap != null)
		{
			let idx:number = row.getInstanceIndex(inst);
			let field:string = idx+";"+inst.name;
			props = rmap.get(field);
			console.log("getting props, inst: "+inst.name+"["+inst.row+"] field: "+field+" "+props);
		}

		return(props);
		*/
	}
}

class Pattern
{
	clazz:string;
	props:FieldProperties;
}