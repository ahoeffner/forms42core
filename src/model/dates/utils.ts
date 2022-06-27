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

import { Alert } from '../../application/Alert.js';
import { Properties } from '../../application/Properties.js';
import { DateToken } from './dates.js';
import {format as formatimpl, parse as parseimpl} from './fecha.js';

/*
	Format strings follow implementation, eg "DD-MM-YYYY HH:mm:ss":
    see https://github.com/taylorhakes/fecha/blob/master/README.md
*/

export interface datepart
{
    token:string;
    delim:string;
}

export class utils
{
	private static date() : string
	{
		return(Properties.DateFormat);
	}

	private static full() : string
	{
		return(Properties.DateFormat+" "+Properties.TimeFormat);
	}

	private static delim() : string
	{
		return(Properties.DateDelimitors);
	}

    public static parse(datestr:string, withtime:boolean, format?:string) : Date
    {
        if (format == null)
		{
			if (withtime) format = utils.full();
			else		  format = utils.date();
		}

        if (datestr == null || datestr.trim().length == 0)
            return(null);

		try
		{
			return(parseimpl(datestr,format));
		}
		catch (error)
		{
			Alert.message(""+error,"Date Parser");
			return(null);
		}
    }

    public static format(date:Date, format?:string) : string
    {
        if (format == null)
			format = utils.full();

		try
		{
			return(formatimpl(date,format));
		}
		catch (error)
		{
			Alert.message(""+error,"Date Formatter");
			return(null);
		}
    }

	public static tokenize(date:Date, format?:string) : DateToken[]
	{
		let tokens:DateToken[] = [];

        if (format == null)
			format = utils.full();

		let delim:string = utils.delim();
		let value:string = utils.format(date);

		if (value == null)
			return(null);

		let start:number = 0;
		for (let i = 0; i < format.length; i++)
		{
			if (delim.includes(format.charAt(i)))
			{
				let token:DateToken =
				{
					pos: start,
					length: i - start,
					mask: format.substring(start,i),
					value: value.substring(start,i)
				}

				tokens.push(token);
				start = i + 1;
			}
		}

		let token:DateToken =
		{
			pos: 0,
			mask: format,
			length: format.length,
			value: value.substring(0,format.length)
		}

		tokens.push(token);

		return(tokens);
	}
}