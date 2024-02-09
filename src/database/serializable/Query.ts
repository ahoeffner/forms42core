import { Filter } from "../../model/interfaces/Filter.js";
import { FilterStructure } from "../../model/FilterStructure.js";
import { DataSource } from "../../model/interfaces/DataSource.js";
import { BindValue } from "../BindValue.js";

export class Query
{
	private order:any = null;
	private columns:string[] = null;
	private source:DataSource = null;
	private bindings$: BindValue[] = null;

	public get bindings() : BindValue[]
	{
		return this.bindings$;
	}

	public set bindings(value:BindValue[])
	{
		this.bindings$ = value;
	}

	private filter:FilterStructure = null;

	constructor(source:DataSource, columns:string|string[], filter?:Filter|Filter[]|FilterStructure, order?:any, bindings?:BindValue[])
	{
		if (!Array.isArray(columns))
			columns = [columns];

		this.order = order;
		this.source = source;
		this.columns = columns;
		this.bindings = bindings;

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

	public serialize() : any
	{
		let json:any = {};

		json.columns = this.columns;
		json.source = this.source.name;

		if (this.bindings$?.length > 0)
		{
			let binding:any[] = [];
			this.bindings$.forEach((b) => binding.push(b.serialize()));
			json.bindings = binding;
		}

		if (this.filter)
			json.filters = this.filter.serialize().filters;

		if (this.order)
			json.order = this.order;

		return(json);
	}
}