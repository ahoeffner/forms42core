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

import { Record, RecordStatus } from "../Record.js";
import { FilterStructure } from "../FilterStructure.js";
import { DataSource } from "../interfaces/DataSource.js";

export class MemoryTable implements DataSource
{
	private pos$:number = 0;

	private order$:string = null;
	private columns$:string[] = [];
	private records$:Record[] = [];
	private inserted$:Record[] = [];
	private sorting$:SortOrder[] = [];

	public arrayfecth:number = 1;
	private filter:FilterStructure;

	public constructor(columns?:string|string[], records?:number|any[][])
	{
		if (columns == null) columns = [];
		if (records == null) records = [];

		if (!Array.isArray(columns))
			columns = [columns];

		this.columns$ = columns;

		if (typeof records === "number")
		{
			let rows:number = records;

			records = [];
			if (columns != null && columns.length > 0)
			{
				for (let r = 0; r < rows; r++)
				{
					let row:any[] = [];

					for (let c = 0; c < columns.length; c++)
						row.push(null);

						records.push(row);
				}
			}
		}

		records.forEach((rec) =>
		{
			let data:{[name:string]: any} = {};

			for (let i = 0; i < rec.length && i < columns.length; i++)
				data[columns[i]] = rec[i];

			this.records$.push(new Record(this,data));
		});
	}

	public get sorting() : string
	{
		return(this.order$);
	}

	public set sorting(order:string)
	{
		this.order$ = order;
		this.sorting$ = SortOrder.parse(order);
	}

	public get columns() : string[]
	{
		return(this.columns$);
	}

	public set columns(columns:string[])
	{
		this.columns = columns;
	}

	public async lock(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async post() : Promise<boolean>
	{
		this.records$.push(...this.inserted$);
		this.inserted$ = [];

		this.records$.forEach((record) =>
		{
			record.prepared = false;
			record.status = RecordStatus.Query;
		})

		return(true);
	}

	public async refresh(_record:Record) : Promise<void>
	{
	}

	public async insert(record:Record) : Promise<boolean>
	{
		this.inserted$.push(record);
		return(true);
	}

	public async update(_record:Record) : Promise<boolean>
	{
		return(true);
	}

	public async delete(record:Record) : Promise<boolean>
	{
		let rec:number = this.indexOf(this.records$,record.id);

		if (rec >= 0)
		{
			this.pos$--;
			this.records$.splice(rec,1);
		}
		else
		{
			rec = this.indexOf(this.inserted$,record.id);

			if (rec >= 0)
				this.inserted$.splice(rec,1);
		}

		return(rec >= 0);
	}

	public async fetch() : Promise<Record[]>
	{
		if (this.pos$ >= this.records$.length)
			return([]);

		while(this.pos$ < this.records$.length)
		{
			if (this.filter.empty)
				return([this.records$[this.pos$++]]);

			if (await this.filter.evaluate(this.records$[this.pos$]))
				return([this.records$[this.pos$++]]);

			this.pos$++;
		}

		return([]);
	}

	public async query(filter:FilterStructure) : Promise<boolean>
	{
		this.post();

		this.pos$ = 0;
		this.filter = filter;

		if (this.sorting$.length > 0)
		{
			this.records$ = this.records$.sort((r1,r2) =>
			{
				for (let i = 0; i < this.sorting$.length; i++)
				{
					let column:string = this.sorting$[i].column;
					let ascending:boolean = this.sorting$[i].ascending;

					let value1:any = r1.getValue(column);
					let value2:any = r2.getValue(column);

					if (value1 < value2)
						return(ascending ? -1 : 1)

					if (value1 > value2)
						return(ascending ? 1 : -1)

					return(0);
				}
			})
		}

		return(true);
	}

	public closeCursor(): void
	{
	}

	private indexOf(records:Record[],oid:any) : number
	{
		for (let i = 0; i < records.length; i++)
		{
			if (records[i].id == oid)
				return(i);
		}
		return(-1);
	}
}

class SortOrder
{
	column:string;
	ascending:boolean = true;

	static parse(order:string) : SortOrder[]
	{
		let sorting:SortOrder[] = [];

		if (order != null)
		{
			let parts:string[] = order.split(",");

			parts.forEach((column) =>
			{
				column = column.trim();

				if (column.length > 0)
				{
					let ascending:string = null;

					if (column.includes(' '))
					{
						let tokens:string[] = column.split(' ');

						column = tokens[0].trim();
						ascending = tokens[1].trim();
					}

					column = column.toLowerCase();
					ascending = ascending?.toLowerCase();

					let part:SortOrder = new SortOrder();

					part.column = column;
					if (ascending == "desc") part.ascending = false;

					sorting.push(part);
				}
			})
		}

		return(sorting);
	}
}