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

import { Like } from "./Like.js";
import { ILike } from "./ILike.js";
import { Equals } from "./Equals.js";
import { Contains } from "./Contains.js";
import { Filter } from "../interfaces/Filter.js";

export class Filters
{
	public static Like(spec:string) : Filter {return(new Like(spec))};
	public static ILike(spec:string) : Filter {return(new ILike(spec))};
	public static Equals(spec:string) : Filter {return(new Equals(spec))};
	public static Contains(spec:string) : Filter {return(new Contains(spec))};
}