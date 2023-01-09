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

import { Block as ModelBlock } from "../model/Block.js";
import { DataSource } from "./interfaces/DataSource.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";

export class DataModel
{
	private defined$:Map<string,DataSource> =
		new Map<string,DataSource>();

	private sources$:Map<ModelBlock,DataSourceWrapper> =
		new Map<ModelBlock,DataSourceWrapper>();

	public clear(block:ModelBlock, flush:boolean) : void
	{
		this.getWrapper(block)?.clear(flush);
	}

	public getWrapper(block:ModelBlock) : DataSourceWrapper
	{
		return(this.sources$.get(block));
	}

	public setWrapper(block:ModelBlock) : DataSourceWrapper
	{
		let wrapper:DataSourceWrapper = new DataSourceWrapper(block);
		this.sources$.set(block,wrapper);
		return(wrapper);
	}

	public getDataSource(block:string) : DataSource
	{
		let src:DataSource = this.defined$.get(block);
		if (src != null) this.defined$.delete(block);
		return(src);
	}

	public setDataSource(block:string, source:DataSource) : void
	{
		this.defined$.set(block,source);
	}
}