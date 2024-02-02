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

import { Case } from "./Case.js";
import { BindValue } from "../database/BindValue.js";
import { Filter } from "../model/interfaces/Filter.js";
import { DataSource } from "../model/interfaces/DataSource.js";

 /**
 * Function that preprocesses user input
 * before applying it to the LOV query
 *
 * @param filter - The user input to be preprocessed.
 */
export interface LOVFilterPreProcessor
{
    (filter?:string) : string;
}


/**
 * List of values
 */
export class ListOfValues
{
	/** Window title */
	title:string;

	/** The number of rows to display */
	rows?:number; 
	/** Width of the display fields */										
	width?:string;
	/** CSS class to apply */ 									
	cssclass?:string;

	/** Use in Query By Example mode */									
	inQueryMode?:boolean;
	/** Use even if field is readonly */							
	inReadOnlyMode?:boolean;

	/** The datasource providing the data */
	datasource:DataSource;
	/** Filters to apply when user restricts query */
	filter?:Filter|Filter[];
	/** BindValues to apply when user restricts query */
	bindvalue?:BindValue|BindValue[];

	/** Control the casing of the user input */
	filterCase?:Case;
	/** Prefix to query-string e.g % */
	filterPrefix?:string;
		/** Postfix to query-string e.g % */
	filterPostfix:string;
	/** Minimum length of query-string before query the datasource */ 							
	filterMinLength:number;
	/** Use value of a given field as initial filter */ 							
	filterInitialValueFrom:string;
	/** Function to format the query-string if advanced */ 					
	filterPreProcesser:LOVFilterPreProcessor; 	

	/** The fields from the datasource */
	sourcefields:string|string[];
	/** The fields in the target form */ 					
	targetfields:string|string[];
	/** The fields to display in the form */ 					
	displayfields:string|string[]; 					
}