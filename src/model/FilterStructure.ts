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
import { BindValue } from "../database/BindValue.js";

export class FilterStructure
{
	private entries$:Constraint[] = [];
	private bindvalues:BindValue[] = [];

	private fieldidx$:Map<string,Constraint> =
		new Map<string,Constraint>();

	private filteridx$:Map<Filter|FilterStructure,Constraint> =
		new Map<Filter|FilterStructure,Constraint>();

	public get empty() : boolean
	{
		return(this.getFilters().length == 0);
	}

	public size() : number
	{
		return(this.entries$.length);
	}

	public hasChildFilters() : boolean
	{
		for (let i = 0; i < this.entries$.length; i++)
		{
			if (this.entries$[i].isFilter())
				return(true);
		}
		return(false);
	}

	public clear(name?:string) : void
	{
		if (name == null)
		{
			this.entries$ = [];
			this.fieldidx$.clear();
			this.filteridx$.clear();
		}
		else
		{
			this.delete(name);
		}
	}

	public or(filter:Filter|FilterStructure, name?:string) : void
	{
		if (filter == this)
			return;

		if (name != null)
			this.delete(name);

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

		if (name != null)
			this.delete(name);

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
				this.fieldidx$.delete(cstr.name);
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

	public asSQL() : string
	{
		this.bindvalues = [];
		return(this.build(0,this.bindvalues));
	}

	public getBindValues() : BindValue[]
	{
		return(this.bindvalues);
	}

	public build(level:number, bindv:BindValue[]) : string
	{
		let stmt:string = "";
		let first:boolean = true;

		for (let i = 0; i < this.entries$.length; i++)
		{
			let constr:Constraint = this.entries$[i];

			if (constr.filter instanceof FilterStructure)
			{
				if (constr.filter.hasChildFilters())
				{
					if (!first || level > 0) stmt += " " + constr.opr + " ";
					stmt += "(" + constr.filter.build(level+1,this.bindvalues) + ")";
					first = false;
				}
				else
				{
					stmt += constr.filter.build(level+1,this.bindvalues);
				}
			}
			else
			{
				if (!first)
					stmt += " " + constr.opr + " ";

				stmt += constr.filter.asSQL();
				this.bindvalues.push(...constr.filter.getBindValues());

				first = false;
			}
		}

		return(stmt);
	}

	public toString() : string
	{
		let str:string = this.build(0,[]);
		return(str);
	}

	private getFilters(start?:FilterStructure) : Filter[]
	{
		let filters:Filter[] = [];
		if (start == null) start = this;

		for (let i = 0; i < start.entries$.length; i++)
		{
			if (start.entries$[i].isFilter())
			{
				filters.push(start.entries$[i].filter as Filter);
			}
			else
			{
				filters.push(...this.getFilters(start.entries$[i].filter as FilterStructure))
			}
		}

		return(filters);
	}
}

class Constraint
{
	constructor(public and$:boolean, public filter:Filter|FilterStructure, public name:string) {}

	get or() : boolean
	{
		return(!this.and$);
	}

	get and() : boolean
	{
		return(this.and$);
	}

	get opr() : string
	{
		if (this.and) return("and");
		return("or");
	}

	isFilter() : boolean
	{
		return(!(this.filter instanceof FilterStructure));
	}

	async matches(record:Record) : Promise<boolean>
	{
		return(this.filter.evaluate(record));
	}
}