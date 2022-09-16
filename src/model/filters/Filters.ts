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
import { Filter } from "../interfaces/Filter.js";

export class Filters
{
	public static In(column:string) : Filter {return(new In(column))};
	public static Null(column:string) : Filter {return(new Null(column))};
	public static Like(column:string) : Filter {return(new Like(column))};
	public static ILike(column:string) : Filter {return(new ILike(column))};
	public static Equals(column:string) : Filter {return(new Equals(column))};
	public static Contains(columns:string) : Filter {return(new Contains(columns))};
	public static LT(column:string, incl?:boolean) : Filter {return(new LT(column,incl))};
	public static GT(column:string, incl?:boolean) : Filter {return(new GT(column,incl))};
	public static Between(column:string, incl?:boolean) : Filter {return(new Between(column,incl))};
}