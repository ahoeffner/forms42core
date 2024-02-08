import { Query } from "../model/statements/Query.js";
import { SubQuery } from "../model/filters/SubQuery.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DataSource } from "../model/interfaces/DataSource.js";

export class JSONRequestBuilder
{
	public static select(source:DataSource, columns:string[], filter:FilterStructure, order?:any) : Query
	{
		return(new Query(source,columns,filter,order));
	}

	public static subquery(source:DataSource, mstcols:string[], detcols:string[], filter:FilterStructure) : SubQuery
	{
		let subq:SubQuery = new SubQuery(mstcols);
		subq.query = new Query(source,detcols,filter);
		return(subq);
	}
}