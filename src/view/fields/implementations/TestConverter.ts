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

import { DataConverter, Tier } from "../DATAConverter.js";

export class TestConverter implements DataConverter
{
	public update: boolean;
	private value:string = null;

	private static b2f:Map<string,string> = new Map<string,string>
	(
		[
			["DK","Denmark"],
			["SE","Sweden"],
			["NO","Norway"],
		]
	)

	private static f2b:Map<string,string> = new Map<string,string>
	(
		[
			["Denmark","DK"],
			["Sweden","SE"],
			["Norway","NO"],
		]
	)

	public getValue(tier:Tier) : any
	{
		console.log("getValue("+Tier[tier]+") value: "+this.value);

		if (tier == Tier.Backend) return(TestConverter.b2f.get(this.value));
		else					  return(TestConverter.f2b.get(this.value));
	}

	public setValue(tier:Tier, value:any) : boolean
	{
		this.value = value;
		console.log("setValue("+Tier[tier]+","+value+")");

		if (tier == Tier.Frontend)
		{
			if (value == "DK") this.value = "Denmark";
			if (value == "SE") this.value = "Sweden";
			if (value == "NO") this.value = "Norway";
		}
		else
		{
			if (value == "Denmark") this.value = "DK";
			if (value == "Sweden")  this.value = "SE";
			if (value == "Norway")  this.value = "NO";
		}

		return(true)
	}

	public getIntermediateValue(tier:Tier) : string
	{
		let value:string = this.getValue(tier);
		console.log("getIntermediateValue("+Tier[tier]+") value: "+value);
		return(value);
	}

	public setIntermediateValue(tier:Tier, value:string) : void
	{
		this.value = value;
		console.log("setIntermediateValue("+Tier[tier]+","+value+") -> "+this.value);
	}
}