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

import { Record } from "./interfaces/Record.js";
import { DataSource } from "./interfaces/DataSource.js";

export class DataModel
{

}

class DataSourceWrapper
{
	private eof$:boolean;
	private cache$:Record[];
	private window$:number = 0;
	private winpos$:number[] = [0,-1];

	constructor(private source:DataSource)
	{
		this.cache$ = [];
		this.eof$ = false;
	}

	public set window(size:number)
	{
		this.window$ = size;
	}

	public async fetch(previous?:boolean) : Promise<Record>
	{
		if (previous)
		{
			if (this.winpos$[0] < 1)
				return(null);

			this.winpos$[0]--;

			if (this.winpos$[1] - this.winpos$[0] + 1 > this.window$)
				this.winpos$[1]--;

			return(this.cache$[this.winpos$[0]]);
		}
		else
		{
			if (this.winpos$[1] >= this.cache$.length-1)
			{
				if (this.eof$) return(null);
				let recs:Record[] = await this.source.fetch();

				if (recs == null || recs.length == 0)
				{
					this.eof$ = true;
					return(null);
				}

				if (recs.length < this.source.arrayfecth)
					this.eof$ = true;

				this.cache$.push(...recs);
			}

			this.winpos$[1]++;

			if (this.winpos$[1] - this.winpos$[0] + 1 > this.window$)
				this.winpos$[0]++;

			return(this.cache$[this.winpos$[1]]);
		}
	}
}