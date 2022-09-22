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

import { Record } from '../Record.js';
import { FilterStructure } from '../FilterStructure.js';

export interface DataSource
{
	sorting:string;
	columns:string[];
	arrayfecth:number;

	fetch() : Promise<Record[]>;
	flush() : Promise<Record[]>;
	closeCursor() : Promise<boolean>;
	lock(record:Record) : Promise<boolean>;
	refresh(record:Record) : Promise<void>;
	insert(record:Record) : Promise<boolean>;
	update(record:Record) : Promise<boolean>;
	delete(record:Record) : Promise<boolean>;
	addColumns(columns:string|string[]) : void;
	clone(columns?:string|string[]) : DataSource;
	query(filters?:FilterStructure) : Promise<boolean>;
}