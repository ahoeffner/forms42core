import { DataType } from "../DataType.js";
import { BindValue } from "../BindValue.js";


export interface Serializable
{
	serialize() : any; /** Serialized object */
}


const datetypes:Set<string> = new Set<string>(["date","datetime","timestamp"]);

export function applyTypes(datatypes:Map<string,DataType|string>, bindvalues:BindValue[]|Map<string,BindValue>) : void
{
	if (!datatypes)
		return;

	bindvalues?.forEach((b:BindValue) =>
	{
		let col:string = b.column?.toLowerCase();
		let t:string|DataType = datatypes.get(col);
		if (typeof t !== "string") t = DataType[t];
		if (!b.forceDataType && t != null) b.type = t;

		if (b.value instanceof Date && datetypes.has(b.type.toLowerCase()))
			b.value = b.value.getTime();
	})
}