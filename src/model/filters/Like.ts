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


export class Like implements Filter
{
	private column$:string = null;
	private bindval$:string = null;
	private ltrunc:boolean = false;
	private rtrunc:boolean = false;
	private parsed:boolean = false;
	private constraint$:string = null;

	public constructor(column:string)
	{
		this.column$ = column;
		this.bindval$ = column;
	}

	public clear() : void
	{
		this.constraint$ = null;
	}

	public getBindValueName() : string
	{
		return(this.bindval$);
	}

	public setBindValueName(name: string) : Filter
	{
		this.bindval$ = name;
		return(this);
	}

	public setConstraint(value:any) : Filter
	{
		this.constraint = value;
		return(this);
	}

	public get constraint() : string
	{
		return(this.constraint$);
	}

	public set constraint(value:string)
	{
		this.constraint$ = value;
		this.constraint$ = this.constraint$.replace("*","%");
	}

	public getBindValues(): BindValue[]
	{
		return([new BindValue(this.bindval$,this.constraint$)]);
	}

	public async evaluate(record:Record) : Promise<boolean>
	{
		if (this.column$ == null) return(false);
		if (this.constraint$ == null) return(false);

		if (!this.parsed)
		{
			this.parsed = true;

			if (this.constraint$.endsWith("%")) this.rtrunc = true;
			if (this.constraint$.startsWith("%")) this.ltrunc = true;

			if (this.ltrunc) this.constraint$ = this.constraint$.substring(1);
			if (this.rtrunc) this.constraint$ = this.constraint$.substring(0,this.constraint$.length-1);
		}

		let value:string = record.getValue(this.column$.toLowerCase())+"";

		if (value == null)
			return(false);

		if (this.rtrunc && this.ltrunc)
		{
			if (value.includes(this.constraint$)) return(true);
			return(false);
		}

		if (this.rtrunc)
		{
			if (value.startsWith(this.constraint$)) return(true);
			return(false);
		}

		if (this.ltrunc)
		{
			if (value.endsWith(this.constraint$)) return(true);
			return(false);
		}

		return(value == this.constraint$);
	}

	public asSQL() : string
	{
		if (this.constraint$ == null)
			return("1 == 2");

		if (this.bindval$ == null)
			this.bindval$ = this.column$;

		let whch:string = this.column$ + " like :"+this.bindval$;

		return(whch)
	}
}