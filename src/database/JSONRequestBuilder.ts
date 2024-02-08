import { Query } from "../model/statements/Query";
import { FilterStructure } from "../model/FilterStructure";
import { DataSource } from "../model/interfaces/DataSource";

export class JSONRequestBuilder
{
	public static select(source:DataSource, columns:string[], filter:FilterStructure) : Query
	{
		let json:any = {};

		json.columns = columns;
		json.source = source.name;
		json.filters = filter.asJSON().filters;

		console.log(JSON.stringify(json));
		return(null);
	}
}