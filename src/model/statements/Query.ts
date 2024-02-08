import { Filter } from "../interfaces/Filter";
import { DataSource } from "../interfaces/DataSource";
import { FilterStructure } from "../FilterStructure";

export class Query
{
	constructor(public columns:string|string[], public source:DataSource, public filter?:Filter|FilterStructure, public order?:any)
	{
		if (!Array.isArray(columns))
			columns = [columns];
	}

	public asJSON() : any
	{
		let json:any = {};

		json.columns = this.columns;
		json.source = this.source.name;

		if (this.filter)
			json.filters = this.filter.asJSON().filters;

		if (this.order)
			json.order = this.order;
		
		return(json);
	}
}