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

import { In } from "./In.js";
import { LT } from "./LT.js";
import { GT } from "./GT.js";
import { Like } from "./Like.js";
import { Null } from "./Null.js";
import { ILike } from "./ILike.js";
import { Equals } from "./Equals.js";
import { Between } from "./Between.js";
import { Contains } from "./Contains.js";
import { SubQuery } from "./SubQuery.js";
import { DateInterval } from "./DateInterval.js";

export class Filters
{
	public static In(column:string) : In {return(new In(column))};
	public static Null(column:string) : Null {return(new Null(column))};
	public static Like(column:string) : Like {return(new Like(column))};
	public static ILike(column:string) : ILike {return(new ILike(column))};
	public static Equals(column:string) : Equals {return(new Equals(column))};
	public static LT(column:string, incl?:boolean) : LT {return(new LT(column,incl))};
	public static GT(column:string, incl?:boolean) : GT {return(new GT(column,incl))};
	public static Contains(columns:string|string[]) : Contains {return(new Contains(columns))};
	public static SubQuery(columns:string|string[]) : SubQuery {return(new SubQuery(columns))};
	public static DateInterval(column:string) : DateInterval {return(new DateInterval(column))};
	public static Between(column:string, incl?:boolean) : Between {return(new Between(column,incl))};
}