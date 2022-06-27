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
import { Alert } from "../../application/Alert.js";
import { Properties } from "../../application/Properties.js";

export interface DateToken
{
	pos:number,
	length:number,
	mask:string,
	value:string,
	type:DatePart
}

export interface FormatToken
{
	pos:number,
	length:number,
	mask:string,
	type:DatePart,
	delimitor:string
}

export enum DatePart
{
	Date,
	Year,
	Month,
	Day,
	Hour,
	Minute,
	Second
}

export class dates
{
	private static validated$:boolean = null;

	private static validate() : boolean
	{
		if (Properties.DateFormat != "DD-MM-YYYY" && Properties.DateFormat != "YYYY-MM-DD")
		{
			Alert.fatal("Illegal default format. Only 'DD-MM-YYYY' or 'YYYY-MM-DD' is currently implemented","Date format failure");
			return(false);
		}

		if (Properties.TimeFormat != 'HH:mm:ss')
		{
			Alert.fatal("Illegal default time-format. Only 'HH:mm:ss' is currently implemented","Date format failure");
			return(false);
		}

		return(true);
	}

	public static parse(datestr:string, withtime?:boolean, format?:string) : Date
    {
		if (dates.validated$ == null)
			dates.validated$ == dates.validate();

		if (withtime == null)
			withtime = datestr.includes(' ');

        return(utils.parse(datestr,withtime,format));
    }

    public static format(date:Date, format?:string) : string
    {
		if (dates.validated$ == null)
			dates.validated$ == dates.validate();

        return(utils.format(date,format));
    }

    public static tokenizeDate(date:Date, format?:string) : DateToken[]
    {
		if (dates.validated$ == null)
			dates.validated$ == dates.validate();

        return(utils.tokenize(date,format));
    }

	public static getTokenType(token:string) : DatePart
	{
		if (dates.validated$ == null)
			dates.validated$ == dates.validate();

		switch(token)
		{
			case "DD": 	 return(DatePart.Day);
			case "MM": 	 return(DatePart.Month);
			case "YYYY": return(DatePart.Year);
			case "HH": 	 return(DatePart.Hour);
			case "mm": 	 return(DatePart.Minute);
			case "ss": 	 return(DatePart.Second);
			default  : 	 return(null);
		}
	}

    public static tokenizeFormat(format?:string) : FormatToken[]
    {
		if (dates.validated$ == null)
			dates.validated$ == dates.validate();

		let tokens:FormatToken[] = [];

        if (format == null)
			format = utils.full();

		let delim:string = utils.delim();

		let start:number = 0;
		for (let i = 0; i < format.length; i++)
		{
			if (delim.includes(format.charAt(i)))
			{
				let token:FormatToken =
				{
					pos: start,
					length: i - start,
					delimitor: format.charAt(i),
					mask: format.substring(start,i),
					type: this.getTokenType(format.substring(start,i))
				}

				tokens.push(token);
				start = i + 1;
			}
		}

		tokens.push(
		{
			pos: start,
			delimitor: '',
			mask: format.substring(start),
			length: format.length - start,
			type: this.getTokenType(format.substring(start))
		});

		return(tokens);
    }
}