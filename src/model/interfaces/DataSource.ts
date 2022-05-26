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

import { Filter } from './Filter.js';
import { Record } from './Record.js';

export interface DataSource
{
	after() : Record;
	before() : Record;

	getFilters() : Filter[];
	addFilter(filter:Filter) : void;
	setFilters(filters:Filter[]) : void;

	query() : Promise<boolean>;
	delete(rec:number) : Promise<boolean>;
	update(record:Record) : Promise<boolean>;
	insert(oid?:any, before?:boolean) : Promise<Record>;
	fetch(oid?:any, records?:number, forward?:boolean) : Promise<Record[]>;
}