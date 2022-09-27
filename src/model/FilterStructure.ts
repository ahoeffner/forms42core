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

	public asSQL(top?:boolean) : string
	{
		let stmt:string = "";
		if (top == null) top = true;

		for (let i = 0; i < this.entries$.length; i++)
		{
			let clause:string = null;
			let constr:Constraint = this.entries$[i];

			if (constr.filter instanceof FilterStructure)
			{
				if (constr.filter.hasChildFilters())
				{
					if (!top) stmt += constr.opr + " ";
					stmt += "(" + constr.filter.asSQL(top) + ") ";
					top = false;
				}
				else
				{
					stmt += constr.filter.asSQL(top);
				}
			}
			else
			{
				if (!top) stmt += constr.opr + " ";
				stmt += constr.filter.asSQL();
				top = false;
			}
		}

		return(stmt);
	}

	public toString() : string
	{
		let str:string = "";

		this.entries$.forEach((cons) =>
		{
			if (str.length > 0) str += " ";

			if (cons.filter instanceof FilterStructure)
			{
				str += cons.name+" ";
				str += cons.filter.toString();
			}
			else
			{
				str += cons.filter.constructor.name+" ";
				str += (""+cons.filter.constraint).substring(0,10);
			}
		})

		return(str);
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