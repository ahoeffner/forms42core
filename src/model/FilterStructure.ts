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

import { Record } from "./Record.js";
import { Filter } from "./interfaces/Filter.js";


export class FilterStructure
{
	private entries$:Constraint[] = [];

	private fieldidx$:Map<string,Constraint> =
		new Map<string,Constraint>();

	private filteridx$:Map<Filter|FilterStructure,Constraint> =
		new Map<Filter|FilterStructure,Constraint>();

	public get empty() : boolean
	{
		return(this.entries$.length == 0);
	}

	public size() : number
	{
		return(this.entries$.length);
	}

	public clear() : void
	{
		this.entries$ = [];
		this.filteridx$.clear();
	}

	public or(filter:Filter|FilterStructure, name?:string) : void
	{
		if (filter == this)
			return;

		if (!this.filteridx$.has(filter))
		{
			let cstr:Constraint = new Constraint(false,filter,name);
			if (name) this.fieldidx$.set(name.toLowerCase(),cstr);
			this.filteridx$.set(filter,cstr);
			this.entries$.push(cstr);
		}
	}

	public and(filter:Filter|FilterStructure, name?:string) : void
	{
		if (filter == this)
			return;

		if (!this.filteridx$.has(filter))
		{
			let cstr:Constraint = new Constraint(true,filter,name);
			if (name) this.fieldidx$.set(name.toLowerCase(),cstr);
			this.filteridx$.set(filter,cstr);
			this.entries$.push(cstr);
		}
	}

	public get(field:string) : Filter|FilterStructure
	{
		return(this.fieldidx$.get(field?.toLowerCase())?.filter);
	}

	public delete(filter:string|Filter|FilterStructure) : boolean
	{
		if (typeof filter === "string")
			filter = this.get(filter);
			
		let cstr:Constraint = this.filteridx$.get(filter);

		if (cstr != null)
		{
			let pos:number = this.entries$.indexOf(cstr);

			if (pos >= 0)
			{
				this.entries$.splice(pos,1);
				this.filteridx$.delete(filter);
				this.fieldidx$.delete(cstr.field);
				return(true);
			}
		}

		return(false);
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		let match:boolean = true;

		for (let i = 0; i < this.entries$.length; i++)
		{
			if (match && this.entries$[i].or)
				continue;

			if (!match && this.entries$[i].and)
				continue;

			match = await this.entries$[i].matches(record);
		}

		return(match);
	}

	public toString() : string
	{
		let str:string = "";

		this.entries$.forEach((cons) =>
		{
			if (str.length > 0) str += " ";
			str += cons.filter.constructor.name;
			if (cons.filter["constraint"]) str += cons.filter["constraint"];
			else 									 str += cons.filter.toString();
		})

		return(str);
	}
}

class Constraint
{
	constructor(public and$:boolean, public filter:Filter|FilterStructure, public field:string) {}

	get or() : boolean
	{
		return(!this.and$);
	}

	get and() : boolean
	{
		return(this.and$);
	}

	async matches(record:Record) : Promise<boolean>
	{
		return(this.filter.evaluate(record));
	}
}