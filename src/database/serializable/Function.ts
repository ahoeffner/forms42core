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

import { DataType } from "../DataType.js";
import { Procedure } from "./Procedure.js";
import { Parameter, ParameterType } from "../Parameter.js";


/** Defines a procedure or function call */
export class Function extends Procedure
{
	private retarg$:Parameter = null;

	/** Define return value for functions */
	public returns(name:string, type?:DataType|string) : void
	{
		this.retarg$ = new Parameter(name,null,type,ParameterType.out);
	}

	public getReturnValue() : any
	{
		let value:any = this.response$[this.retarg$.name];

		if (this.retarg$.isDate() && typeof value === "number")
			value = new Date(value);

		return(value);
	}

	public serialize() : any
	{
		let json:any = super.serialize();
		if (this.retarg$) json.returning = this.retarg$.serialize();
		return(json);
	}
}