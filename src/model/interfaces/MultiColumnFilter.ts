import { Filter } from "./Filter";

export interface MultiColumnFilter
{
	columns:string[];
}

export function isMultiColumnFilter(filter:Filter|MultiColumnFilter) : filter is MultiColumnFilter
{
	return("columns" in filter);
}
