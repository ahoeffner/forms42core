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

import { Form } from "./Form.js";


export class BlockCoordinator
{
	constructor(private form:Form) {}
	private roots$:Map<string,Child> = new Map<string,Child>();
	private query$:QueryCoordinator = new QueryCoordinator(this);

	public setQueryMaster(block:string) : void
	{
		this.query$.qmaster$ = block;
	}

	add(mstflds:string|string[], block:string, detflds:string|string[]) : void
	{

	}
}

class QueryCoordinator
{
	qmaster$:string = null;
	constructor(private blkcord$:BlockCoordinator) {}
}

class Child
{
	private children$:Map<string,Child> = new Map<string,Child>();
	private fldmap$:Map<string,Child[]> = new Map<string,Child[]>();
	constructor(public mstblk?:string, public mstflds?:string[], public detblk?:string, public detflds?:string[]) {}

	add(mstflds:string|string[], detblk:string, detflds:string|string[]) : void
	{
		if (detblk == null || mstflds == null || detflds == null)
			return;

		if (!Array.isArray(mstflds))
			mstflds = [mstflds];

		if (!Array.isArray(detflds))
			detflds = [detflds];

		let key:string = "";
		mstflds.forEach((field) => key += ","+field);
		let child:Child = new Child(detblk,mstflds,detblk,detflds);

		this.children$.set(key.substring(1),child);

		mstflds.forEach((fld) =>
		{
			let children:Child[] = this.fldmap$.get(fld);

			if (children == null)
			{
				children = [];
				this.fldmap$.set(fld,children)
			}

			children.push(child);
		});
	}

	children(fld?:string) : Child[]
	{
		if (fld) return(this.fldmap$.get(fld));
		else return(Array.from(this.children$.values()));
	}
}