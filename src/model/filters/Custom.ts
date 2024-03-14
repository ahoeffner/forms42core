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

import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";

export class Custom extends Filter
{
	public column:string = null;
	public constraint:any = null;

	private name$:string = null;
	private mapping$:Mapping[] = [];
	private bindvalues$:BindValue[] = [];

	public constructor(name:string)
	{
		super();
		this.name$ = name;
	}

	public clear() : void
	{
		this.bindvalues$ = [];
	}

	public clone() : Custom
	{
		let clone:Custom = new Custom(this.name$);

		clone.mapping$ = this.mapping$;
		clone.bindvalues$ = this.bindvalues$;

		return(clone);
	}

	public serialize() : any
	{
		let json:any = {type: this.constructor.name};
		json.name = this.name$;
		json.mapping = this.mapping$;

		let bv:any[] = this.convert(this.getBindValues());
		if (bv.length > 0) json.bindvalues = bv;

		return(json);
	}

	public addMapping(name:string, value:any) : Custom
	{
		this.mapping$.push(new Mapping(name,value));
		return(this);
	}

	public getBindValue() : BindValue
	{
		return(this.getBindValues()[0]);
	}

	public getBindValues() : BindValue[]
	{
		return(this.bindvalues$);
	}

	public addBindValue(bindvalue:BindValue) : Custom
	{
		this.bindvalues$.push(bindvalue)
		return(this);
	}

	public setBindValues(bindvalues:BindValue[]) : Custom
	{
		this.bindvalues$ = this.bindvalues$;
		if (!this.bindvalues$) this.bindvalues$ = [];
		return(this);
	}

	public getBindValueName() : string
	{
		throw new Error("Method not implemented.");
	}

	public setBindValueName(name: string) : Custom
	{
		throw new Error("Method not implemented.");
	}

	public getDataType() : string
	{
		throw new Error("Method not implemented.");
	}

	public setDataType(_type: DataType): Filter
	{
		throw new Error("Method not implemented.");
	}

	public setConstraint(_value: any): Filter
	{
		throw new Error("Method not implemented.");
	}

	public evaluate(_record:Record): Promise<boolean>
	{
		throw new Error("Method not implemented.");
	}
}


class Mapping
{
	constructor(public name:string, public value:any) {}
	//serialize() : any {return({name: this.name, value: this.value})}
}