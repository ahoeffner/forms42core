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

export class dates
{
    public static parse(datestr:string, format?:string) : Date
    {
        return(utils.parse(datestr,format));
    }

    public static format(date:Date, format?:string) : string
    {
        return(utils.format(date,format));
    }
}