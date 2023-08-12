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

export enum Validity
{
    na,
    true,
    false,
    asupper,
    aslower
}

export interface Formatter
{
	size() : number;
	isNull() : boolean;

	format:string;
	datatype:DataType;
	placeholder:string;

	getValue() : string;
	setValue(value:any) : boolean;

	prev(from:number) : number;
	next(from:number) : number;

	delete(fr:number,to:number) : string;

	modifiable(pos:number) : boolean
	insCharacter(pos:number, c:string) : boolean;
	setCharacter(pos:number, c:string) : boolean;

	finish() : string;
}

export interface Section
{
    pos() : number;
    size() : number;
    field() : number;
    isNull() : boolean;
    getValue() : string;
    setValue(value:string) : void;
}