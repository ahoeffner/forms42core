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


export class ILike implements Filter
{
	private column$:string = null;
	private constraint$:string = null;

	public constructor(column:string)
	{
		this.column$ = column;
	}

	public get constraint() : string
	{
		return(this.constraint$);
	}

	public set constraint(value:string)
	{
		this.constraint$ = value;
		value = value.replace("*","%");
	}

	public async matches(record:Record) : Promise<boolean>
	{
		let ltrunc:boolean = false;
		let rtrunc:boolean = false;

		let val:any = record.getValue(this.column$);
		if (val == null) return(false);

		if (this.constraint$.endsWith("%")) rtrunc = true;
		if (this.constraint$.startsWith("%")) ltrunc = true;

		if (rtrunc && ltrunc)
		{
			if ((val+"").toLocaleLowerCase().includes(this.constraint$)) return(true);
			return(false);
		}

		if (rtrunc)
		{
			if ((val+"").toLocaleLowerCase().startsWith(this.constraint$)) return(true);
			return(false);
		}

		if (ltrunc)
		{
			if ((val+"").toLocaleLowerCase().endsWith(this.constraint$)) return(true);
			return(false);
		}

		return((val+"") == this.constraint$);
	}
}