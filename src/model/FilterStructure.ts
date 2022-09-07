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
	}

	public or(filter:Filter|FilterStructure) : void
	{
		this.entries$.push(new Constraint(false,filter));
	}

	public and(filter:Filter|FilterStructure) : void
	{
		this.entries$.push(new Constraint(true,filter));
	}

	public async matches(record:Record) : Promise<boolean>
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
	constructor(public and$:boolean, public filter:Filter|FilterStructure) {}

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
		return(this.filter.matches(record));
	}
}