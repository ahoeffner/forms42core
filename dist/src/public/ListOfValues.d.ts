import { Case } from "./Case.js";
import { BindValue } from "../database/BindValue.js";
import { Filter } from "../model/interfaces/Filter.js";
import { DataSource } from "../model/interfaces/DataSource.js";
/**
 * Function that preprocesses user input
 * before applying it to the LOV query
 */
export interface LOVFilterPreProcessor {
    (filter?: string): string;
}
/**
 * List of values
 */
export declare class ListOfValues {
    title: string; /** Window title */
    rows?: number; /** The number of rows to display */
    width?: string; /** Width of the display fields */
    cssclass?: string; /** CSS class to apply */
    inQueryMode?: boolean; /** Use in Query By Example mode */
    inReadOnlyMode?: boolean; /** Use even if field is readonly */
    datasource: DataSource; /** The datasource providing the data */
    filter?: Filter | Filter[]; /** Filters to apply when user restricts query */
    bindvalue?: BindValue | BindValue[]; /** BindValues to apply when user restricts query */
    filterCase?: Case; /** Control the casing of the user input */
    filterPrefix?: string; /** Prefix to query-string e.g % */
    filterPostfix: string; /** Postfix to query-string e.g % */
    filterMinLength: number; /** Minimum length of query-string before query the datasource */
    filterInitialValueFrom: string; /** Use value of a given field as initial filter */
    filterPreProcesser: LOVFilterPreProcessor; /** Function to format the query-string if advanced */
    sourcefields: string | string[]; /** The fields from the datasource */
    targetfields: string | string[]; /** The fields in the target form */
    displayfields: string | string[]; /** The fields to display in the form */
}
