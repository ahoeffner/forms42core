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

import { utils } from "./utils.js";

export interface DateToken
{
	pos:number,
	length:number,
	mask:string,
	value:string
}

export class dates
{
    public static parse(datestr:string, withtime?:boolean, format?:string) : Date
    {
		if (withtime == null)
			withtime = datestr.includes(' ');

        return(utils.parse(datestr,withtime,format));
    }

    public static format(date:Date, format?:string) : string
    {
        return(utils.format(date,format));
    }

    public static tokenize(date:Date, format?:string) : DateToken[]
    {
        return(utils.tokenize(date,format));
    }
}