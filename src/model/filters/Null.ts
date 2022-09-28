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

import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { BindValue } from "../../database/BindValue.js";


export class Null implements Filter
{
	private column$:string = null;
	private bindval$:string = null;
	private constraint$:string = null;

	public constructor(column:string)
	{
		this.column$ = column;
	}

	public clear() : void
	{
		this.constraint$ = null;
	}

	public getBindValueName() : string
	{
		return(this.bindval$);
	}

	public setBindValueName(name:string) : Filter
	{
		this.bindval$ = name;
		return(this);
	}

	public setConstraint(value:any) : Filter
	{
		this.constraint$ = value;
		return(this);
	}

	public get constraint() : any|any[]
	{
		return(this.constraint$);
	}

	public set constraint(value:any|any[])
	{
		this.constraint$ = value;
	}

	public getBindValues(): BindValue[]
	{
		return([]);
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		if (this.column$ == null) return(false);
		return(record.getValue(this.column$.toLowerCase()) == null);
	}

	public asSQL() : string
	{
		let whcl:string = this.column$ + " is null";
		return(whcl)
	}
}