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

import { Tag } from "./Tag.js";


export class Foreach implements Tag
{
    public parse(_component:any, tag:HTMLElement): string|HTMLElement
    {
		let expr:string = null;
        let block:HTMLElement = document.createElement("div");
        let attrnames:string[] = tag.getAttributeNames();

        for (let an = 0; an < attrnames.length; an++)
		{
			if (attrnames[an].toLowerCase() == "expr") expr = tag.getAttribute(attrnames[an]);
            else block.setAttribute(attrnames[an],tag.getAttribute(attrnames[an]));
		}

		if (expr == null)
			throw "@Foreach: missing expr attribute";

		expr = expr.trim();
		let pos:number = expr.indexOf(" ");

		if (pos <= 0)
			throw "@Foreach: illegal expr "+expr+". Syntax: <var> in <n1>..<n2>";

		// Get index variable
		let index:string = expr.substring(0,pos);

		// Skip "in" keyword
		expr = expr.substring(pos+1);
		pos = expr.indexOf(" ");
		expr = expr.substring(pos+1);

		let range:string[] = expr.split("..");
		if (range.length != 2) throw "@Foreach: illegal expr "+expr+". Syntax: <var> in <n1>..<n2>";

		range[0] = range[0].trim();
		range[1] = range[1].trim();

		if (isNaN(+range[0]) || isNaN(+range[1]))
			throw "@Foreach: illegal expr "+expr+". Syntax: <var> in <n1>..<n2>";

		let ncontent:string = "";
		let replace:number[] = [];
		let content:string = tag.innerHTML;
		if (!index.startsWith("$")) index = "$"+index;

		pos = 0;
		while(pos >= 0)
		{
			pos = content.indexOf(index,pos);

			if (pos > 0)
			{
				let n:string = content.charAt(pos+index.length);

				// Skip if next is letter or number
				if (n.toLowerCase() == n.toUpperCase() && isNaN(+n))
					replace.push(pos);

				pos += index.length;
			}
		}

		for(let i=+range[0]; i <= +range[1]; i++)
		{
			pos = 0;
			let str:string = "";

			for(let r=0; r < replace.length; r++)
			{
				str += content.substring(pos,replace[r]) + i;
				pos = replace[r] + index.length;
			}

			if (pos < content.length)
				str += content.substring(pos);

			ncontent += str;
		}

		block.innerHTML = ncontent;
		return(block);
    }
}