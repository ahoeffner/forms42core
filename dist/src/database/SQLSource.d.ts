import { SQLRest } from "./SQLRest.js";
import { FilterStructure } from "../model/FilterStructure.js";
/**
 * Additional interface for database based datasource
 */
export declare abstract class SQLSource {
    abstract getSubQuery(filter: FilterStructure, mstcols: string | string[], detcols: string | string[]): Promise<SQLRest>;
}
