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

import { Block } from "./Block.js";
import { DataSource } from "./interfaces/DataSource.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";

export enum RecordStatus
{
	New,
	QBE,
	Query,
	Deleted,
	Updated,
	Inserted
}

export class Record
{
	private id$:any;
	private keys$:any[] = [];
	private values$:any[] = [];
	private locked$:boolean = false;
	private prepared$:boolean = false;
	private source$:DataSource = null;
	private wrapper$:DataSourceWrapper = null;
	private status$:RecordStatus = RecordStatus.Query;

	constructor(source:DataSource, columns?:{[name:string]: any})
	{
		this.source$ = source;
		this.id$ = new Object();

		if (columns == null)
		{
			this.status$ = RecordStatus.New;
		}
		else
		{
			Object.keys(columns).forEach((col) =>
			{
				col = col.toLowerCase();

				let idx:number = this.indexOf(col);
				if (idx >= 0) this.values$[idx] = columns[col];
			});
		}
	}

	public get id() : any
	{
		return(this.id$);
	}

	public get keys() : any[]
	{
		return(this.keys$);
	}

	public get block() : Block
	{
		return(this.wrapper$?.block);
	}

	public clear() : void
	{
		this.values$ = [];
	}

	public get source() : DataSource
	{
		return(this.source$);
	}

	public get wrapper() : DataSourceWrapper
	{
		return(this.wrapper$);
	}

	public set wrapper(wrapper:DataSourceWrapper)
	{
		this.wrapper$ = wrapper;
	}

	public get locked() : boolean
	{
		return(this.locked$);
	}

	public set locked(flag:boolean)
	{
		this.locked$ = flag;
	}

	public get prepared() : boolean
	{
		return(this.prepared$);
	}

	public set prepared(flag:boolean)
	{
		this.prepared$ = flag;
	}

	public get values() : {name:string,value:any}[]
	{
		let values:{name:string, value:any}[] = [];

		for (let i = 0; i < this.values$.length; i++)
			values.push({name: this.column(i), value: this.values$[i]});

		return(values);
	}

	public get status() : RecordStatus
	{
		return(this.status$);
	}

	public set status(status:RecordStatus)
	{
		this.status$ = status;
	}

	public addKey(value:any) : void
	{
		this.keys$.push(value);
	}

	public getValue(column:string) : any
	{
		if (column == null)
			return(null);

		column = column.toLowerCase();
		let idx:number = this.indexOf(column);
		return(this.values$[idx]);
	}

	public setValue(column:string,value:any) : void
	{
		if (column == null) return;
		column = column.toLowerCase();
		let idx:number = this.indexOf(column);

		if (this.status == RecordStatus.Query)
			this.status = RecordStatus.Updated;

		this.values$[idx] = value;
	}

	public get columns() : string[]
	{
		let columns:string[] = [];
		columns.push(...this.source.columns);
		columns.push(...this.wrapper.columns);
		return(columns);
	}

	private indexOf(column:string) : number
	{
		let idx:number = this.source.columns.indexOf(column);
		if (idx < 0 && this.wrapper) idx = this.wrapper.indexOf(column);
		return(idx);
	}

	private column(pos:number) : string
	{
		let len:number = this.source.columns.length;
		if (pos < len) return(this.source.columns[pos]);
		else    	      return(this.wrapper.columns[pos-len]);
	}

	public toString() : string
	{
		let str:string = "";

		let cols:number = this.source.columns.length +
						  		this.wrapper.columns.length;

		for (let i = 0; i < cols; i++)
			str += ", "+this.column(i)+"="+this.getValue(this.column(i));

		return(str.substring(2));
	}
}