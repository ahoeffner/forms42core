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
	private value:{frontend:string, backend:string} = {frontend: null, backend: null};

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
		if (tier == Tier.Backend) return(this.value.backend);
		else					  return(this.value.frontend);
	}

	public setValue(tier:Tier, value:any) : void
	{
		if (tier == Tier.Frontend)
		{
			this.value.frontend = value;
			this.value.backend = TestConverter.f2b.get(value);
		}
		else
		{
			this.value.backend = value;
			this.value.frontend = TestConverter.b2f.get(value);
		}
	}

	public getIntermediateValue(tier:Tier) : string
	{
		if (tier == Tier.Backend) return(this.value.backend);
		else 					  return(this.value.frontend);
	}

	public setIntermediateValue(tier:Tier, value:string) : void
	{
		if (tier == Tier.Backend)
		{
			this.value.backend = value;
			this.value.frontend = TestConverter.b2f.get(value);
		}
		else
		{
			this.value.frontend = value;
			this.value.backend = TestConverter.f2b.get(value);
		}
	}

	public toString() : string
	{
		return("value: ["+this.value.frontend+","+this.value.backend+"]")
	}
}