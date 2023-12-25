/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Bundle } from "./interfaces/Bundle";

export class Messages
{
	private static files$:Bundle[] = [];
	private static language$:string = null;

	/** all messages language */
	public static set language(language:string)
	{
		Messages.language$ = language;

	}

	/** all messages language */
	public static get language() : string
	{
		return(Messages.language$);
	}

	/** Add message bundle */
	public static addBundle(bundle:Bundle) : void
	{
		if (!Messages.files$.includes(bundle))
			Messages.files$.push(bundle);
	}

	public static get bundles() : string
	{
		let str:string = "";

		for (let i = 0; i < Messages.files$.length; i++)
		{
			str += Messages.files$[i].name;
			if (i < Messages.files$.length-1) str += ", ";
		}

		return(str);
	}
}