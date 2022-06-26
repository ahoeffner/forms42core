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

import {format as formatimpl, parse as parseimpl} from './fecha.js';

export interface datepart
{
    token:string;
    delim:string;
}

export class utils
{
    private static delim:string = null;
    private static deftmfmt:string = null;
    private static tokens$:datepart[] = null;
    private static deffmt:string = utils.default();

	private static default() : string
	{
		let format:string = "dd-mm-yyyy";
		this.setFormat("DD-MM-YYYY","HH24:MI:SS");
		return(format);
	}

    private static init(format:string) : void
    {
        utils.tokens$ = utils.split(format,"-/:. ");

        for(let i = 0; i < utils.tokens$.length; i++)
        {
            if (utils.tokens$[i].delim != " ")
            {
                utils.delim = utils.tokens$[i].delim;
                break;
            }
        }
    }

    public static setFormat(datefmt:string, timefmt:string) : void
    {
        utils.deffmt = datefmt;
        utils.deftmfmt = timefmt;
        utils.init(datefmt);
    }

    public static getDateFormat() : string
    {
        return(utils.deffmt);
    }

    public static getDateTimeFormat() : string
    {
        return(utils.deftmfmt);
    }

    public static parse(datestr:string, format?:string) : Date
    {
        if (format == null) format = utils.deffmt;

        if (datestr == null || datestr.trim().length == 0)
            return(null);

        let date:Date = parseimpl(datestr,format);
        if (date == null) datestr = utils.reformat(datestr);

        if (datestr == null) return(null);
        return(parseimpl(datestr,format));
    }

    public static parsetime(datestr:string, format?:string) : Date
    {
        if (format == null) format = utils.deftmfmt;

        if (datestr == null || datestr.trim().length == 0)
            return(null);

        let date:Date = parseimpl(datestr,format);
        if (date == null) datestr = utils.reformat(datestr);

        if (datestr == null) return(null);
        return(parseimpl(datestr,format));
    }

    public static format(date:Date, format?:string) : string
    {
        if (format == null) format = utils.deffmt;
        return(formatimpl(date,format));
    }

    public static formattime(date:Date, format?:string) : string
    {
        if (format == null) format = utils.deftmfmt;
        return(formatimpl(date,format));
    }

    private static reformat(datestr:string) : string
    {
        let ndate:string = "";

        if (!isNaN(+datestr))
        {
            let pos:number = 0;

            for(let i = 0; i < 3; i++)
            {
                let len:number = utils.tokens$[i].token.length;
                ndate += datestr.substring(pos,pos+len) + utils.tokens$[i].delim;
                pos += len;
            }

            return(ndate);
        }

        if (utils.delim != "-") datestr = utils.replaceAll(datestr,"-",utils.delim);
        if (utils.delim != "/") datestr = utils.replaceAll(datestr,"/",utils.delim);
        if (utils.delim != ".") datestr = utils.replaceAll(datestr,".",utils.delim);

        let parts:datepart[] = utils.split(datestr,utils.delim+": ");

        for (let i = 0; i < parts.length; i++)
        {
            let numeric:boolean = !isNaN(+parts[i].token);
            if (numeric && parts[i].token.length == 1) parts[i].token = "0"+parts[i].token;
        }

        parts.forEach((part) => {ndate += part.token+part.delim})

        return(ndate);
    }


    private static split(str:string, splitter:string) : datepart[]
    {
        let parts:datepart[] = [];
        let delimiters:Set<string> = new Set<string>();

        for (let i = 0; i < splitter.length; i++)
            delimiters.add(splitter[i]+"");

        let pos:number = 0;

        for (let i = 0; i < str.length; i++)
        {
            if (delimiters.has(str[i]+""))
            {
                parts.push({token: str.substring(pos,i), delim: str[i]});
                pos = i + 1;
            }
        }

        if (pos < str.length)
            parts.push({token: str.substring(pos,str.length), delim: ""});

        return(parts);
    }


    private static replaceAll(str:string, search:string, replace:string) : string
    {
        while(str.indexOf(search) >= 0) str = str.replace(search,replace);
        return(str);
    }
}