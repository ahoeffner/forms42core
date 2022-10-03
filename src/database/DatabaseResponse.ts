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

export class DatabaseResponse
{
	private response$:any;
	private columns$:string[] = [];

	constructor(response:any, columns?:string[])
	{
		this.response$ = response;

		if (columns != null)
		{
			for (let i = 0; i < columns.length; i++)
				this.columns$.push(columns[i].toLowerCase());
		}
	}

	public get failed() : boolean
	{
		return(!this.response$.success);
	}

	public getValue(column:string) : any
	{
		column = column?.toLowerCase();
		let idx:number = this.columns$.indexOf(column);
		let row:any[] = this.response$.rows[0];
		if (row) return(row[idx]);
		return(null);
	}
}