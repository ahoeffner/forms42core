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

import { FilterType } from "./FilterType.js";
import { Filter } from "./interfaces/Filter.js";

export class FilterGroup
{
	private entries$:Constraint[] = [];
	private type$:FilterType = FilterType.detect;

	public get type() : FilterType
	{
		return(this.type$);
	}

	public set type(type:FilterType)
	{
		this.type$ = type;
	}

	public or(filter:Filter) : void
	{
		this.entries$.push(new Constraint(FilterType.or,filter));
	}

	public and(filter:Filter) : void
	{
		this.entries$.push(new Constraint(FilterType.and,filter));
	}

	public where(filter:Filter) : void
	{
		this.entries$.push(new Constraint(FilterType.where,filter));
	}
}

class Constraint
{
	constructor(public type:FilterType, public filter:Filter) {}
}