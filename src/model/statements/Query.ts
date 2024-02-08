import { Filter } from "../interfaces/Filter.js";
import { FilterStructure } from "../FilterStructure.js";
import { DataSource } from "../interfaces/DataSource.js";

export class Query
{
	private order:any = null;
	private columns:string[] = null;
	private source:DataSource = null;
	private filter:FilterStructure = null;

	constructor(source:DataSource, columns:string|string[], filter?:Filter|Filter[]|FilterStructure, order?:any)
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.order = order;
		this.source = source;
		this.columns = columns;

		if (!(filter instanceof FilterStructure))
		{
			if (!Array.isArray(filter)) filter = [filter];
			this.filter = new FilterStructure();
			filter.forEach((flt) => this.filter.and(flt));
		}
		else
		{
			this.filter = filter;
		}
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