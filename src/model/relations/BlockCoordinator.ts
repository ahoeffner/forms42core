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

import { Key } from "./Key.js";
import { Link } from "./Link.js";
import { Form } from "../Form.js";
import { Block } from "../Block.js";
import { Alert } from "../../application/Alert.js";


export class BlockCoordinator
{
	constructor(private form:Form) {}
	private query$:QueryCoordinator = new QueryCoordinator(this);
	private blocks$:Map<string,Dependency> = new Map<string,Dependency>();

	public getDetailBlocks(block:Block) : Block[]
	{
		let blocks:Block[] = [];

		this.blocks$.get(block.name)?.details.forEach((link) =>
		{
			let block:Block = this.form.getBlock(link.detail.block);

			if (block == null)
			{
				Alert.fatal("Block '"+link.detail.block+"', does not exist","Linked Blocks");
				return([]);
			}

			blocks.push(block);
		})

		return(blocks);
	}

	public getMasterBlocks(block:Block) : Block[]
	{
		let blocks:Block[] = [];

		this.blocks$.get(block.name)?.masters.forEach((link) =>
		{
			let block:Block = this.form.getBlock(link.master.block);

			if (block == null)
			{
				Alert.fatal("Block '"+link.master.block+"', does not exist","Linked Blocks");
				return([]);
			}

			blocks.push(block);
		})

		return(blocks);
	}

	public link(link:Link) : void
	{
		let dependency:Dependency = null;
		dependency = this.blocks$.get(link.master.block);

		if (dependency == null)
		{
			dependency = new Dependency(link.master.block);
			this.blocks$.set(dependency.block,dependency);
		}

		dependency.link(link);

		dependency = this.blocks$.get(link.detail.block);

		if (dependency == null)
		{
			dependency = new Dependency(link.detail.block);
			this.blocks$.set(dependency.block,dependency);
		}

		dependency.link(link);
	}

	public setQueryMaster(block:string) : void
	{
		this.query$.qmaster$ = block;
	}
}

class Dependency
{
	constructor(public block:string) {}
	private masters$:Map<string,Link> = new Map<string,Link>();
	private details$:Map<string,Link> = new Map<string,Link>();
	private fldmap$:Map<string,Link[]> = new Map<string,Link[]>();

	public get details() : Link[]
	{
		let links:Link[] = Array.from(this.details$.values());
		return(links != null ? links : []);
	}

	public get masters() : Link[]
	{
		let links:Link[] = Array.from(this.masters$.values());
		return(links != null ? links : []);
	}

	public link(link:Link) : void
	{
		if (link.detail.block == this.block)
		{
			this.masters$.set(link.master.block,link);
		}
		else
		{
			let links:Link[] = null;
			this.details$.set(link.detail.block,link);

			link.master.fields.forEach((fld) =>
			{
				links = this.fldmap$.get(fld);

				if (links == null)
				{
					links = [];
					this.fldmap$.set(fld,links);
				}

				links.push(link);
			})
		}
	}
}

class QueryCoordinator
{
	qmaster$:string = null;
	constructor(private blkcord$:BlockCoordinator) {}
}

/*
	add(master:Key, detail:Key) : void
	{
		if (link == null) return;

		if (link.master == null || link.master.block == null || link.master.fields == null)
		{
			Alert.fatal("Invalid master block definition: "+JSON.stringify(link.master),"Master Detail");
			return;
		}

		if (link.detail == null || link.detail.block == null || link.detail.fields == null)
		{
			Alert.fatal("Invalid detail block definition: "+JSON.stringify(link.detail),"Master Detail");
			return;
		}

		link.master.block = link.master.block.toLowerCase();
		link.detail.block = link.detail.block.toLowerCase();

		let child:Child = this.roots$.find(link.master.block);
		console.log("add to "+child);
		if (child == null) child = this.roots$;
		child.add(link);
	}
}

class Child
{
	constructor(public link?:Link) {}
	private children$:Map<string,Child> = new Map<string,Child>();
	private fldmap$:Map<string,Child[]> = new Map<string,Child[]>();

	add(link:Link) : void
	{
		let key:string = "";

		if (!Array.isArray(link.master.fields))
			link.master.fields = [link.master.fields];

		if (!Array.isArray(link.detail.fields))
			link.detail.fields = [link.detail.fields];

		if (link.master.fields.length != link.detail.fields.length)
		{
			Alert.fatal("Master fields and Detail fields does not match : "+link.master.fields+" "+link.detail.fields,"Master Detail");
			return;
		}

		link.master.block = link.master.block.toLowerCase();
		link.detail.block = link.detail.block.toLowerCase();

		for (let i = 0; i < link.master.fields.length; i++)
			link.master.fields[i] = link.master.fields[i].toLowerCase();

		for (let i = 0; i < link.detail.fields.length; i++)
			link.detail.fields[i] = link.detail.fields[i].toLowerCase();

		link.master.fields.forEach((field) => key += ","+field);

		let child:Child = new Child(link);
		this.children$.set(key.substring(1),child);

		link.master.fields.forEach((fld) =>
		{
			let children:Child[] = this.fldmap$.get(fld);

			if (children == null)
			{
				children = [];
				this.fldmap$.set(fld,children)
			}

			children.push(child);
		});
	}

	find(block:string) : Child
	{
		let children:Child[] = this.children();

		for (let i = 0; i < children.length; i++)
		{
			if (children[i].link.master.block == block)
				return(children[i]);
		}

		for (let i = 0; i < children.length; i++)
		{
			let child:Child = children[i].find(block);
			if (child != null) return(child);
		}

		return(null);
	}

	children(fld?:string) : Child[]
	{
		if (fld) return(this.fldmap$.get(fld));
		else return(Array.from(this.children$.values()));
	}
}
*/