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

export class DynamicCall
{
    public method:string;
    public args:string[] = [];

    constructor(signature:string)
    {
        this.parse(signature);
    }

    private parse(signature:string) : void
    {
        if (signature.startsWith("this."))
            signature = signature.substring(5);

        let pos1:number = signature.indexOf("(");
        let pos2:number = signature.indexOf(")");

        this.method = signature.substring(0,pos1);
        let arglist:string = signature.substring(pos1+1,pos2).trim();

        let n:number = 0;
        let arg:string = "";
        let quote:string = null;

        for(let i=0; i < arglist.length; i++)
        {
            let c:string = arglist.charAt(i);

            if (c == "," && quote == null)
            {
                if (arg.length > 0)
                {
                    this.args.push(arg);
                    n++;
                    arg = "";
                }

                continue;
            }

            if (c == "'" || c == '"')
            {
                if (quote != null && c == quote)
                {
                    n++;
                    quote = null;
                    continue;
                }

                else

                if (quote == null)
                {
                    quote = c;
                    continue;
                }
            }

            arg += c;
        }

        if (this.args.length < n)
            this.args.push(arg);
    }
}