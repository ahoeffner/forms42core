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
import { Block } from "../public/Block.js";
import { FormBacking } from "./FormBacking.js";
import { Class, isClass } from '../types/Class.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';


export class FormMetaData
{
	private static metadata:Map<string,FormMetaData> =
		new Map<string,FormMetaData>();

	private static blockevents$:Map<Function,BlockEvent[]> =
		new Map<Function,BlockEvent[]>();

	public static cleanup(form:Form) : void
	{
		let meta:FormMetaData =
			FormMetaData.metadata.get(form.constructor.name);

		if (meta != null)
		{
			meta.blockattrs.forEach((_block,attr) =>
				{form[attr] = null;});

			FormBacking.getModelForm(form).getBlocks().forEach((blk) =>
				{blk.reset(meta.blocksources$.get(blk.name) != null);})
		}
	}

	public static setBlockEvent(block:Block, method:string, filter:EventFilter|EventFilter[]) : void
	{
		let events:BlockEvent[] = FormMetaData.blockevents$.get(block.constructor);

		if (events == null)
		{
			events = [];
			FormMetaData.blockevents$.set(block.constructor,events);
		}

		events.push(new BlockEvent(method,filter));
	}

	public static getBlockEvents(block:Block) : BlockEvent[]
	{
		let events:BlockEvent[] = FormMetaData.blockevents$.get(block.constructor);
		console.log("get ")
		console.log(block.constructor)
		console.log(events)
		if (events == null) events = [];
		return(events);
	}

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

	public formevents:Map<string,EventFilter|EventFilter[]> =
		new Map<string,EventFilter|EventFilter[]>();

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
		this.blocksources$.set(block?.toLowerCase(),source);
	}

	public getDataSource(block:string) : DataSource
	{
		block = block?.toLowerCase();
		let source:Class<DataSource>|DataSource = this.blocksources$.get(block);

		if (source && isClass(source))
		{
			source = new source();
			this.blocksources$.set(block,source);
		}

		return(source as DataSource);
	}
}

export class BlockEvent
{
	constructor(public method:string, public filter:EventFilter|EventFilter[]) {}
}