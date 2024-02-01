import { Record } from "./Record.js";
import { Filter } from "./interfaces/Filter.js";
import { BindValue } from "../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 *
 * A FilterStructure is a tree like collection of filters. It embraces
 * the where-clause in sql.
 */
export declare class FilterStructure {
    name: string;
    private entries$;
    private fieldidx$;
    private filteridx$;
    constructor(name?: string);
    get empty(): boolean;
    size(): number;
    getName(filter: Filter): string;
    clone(): FilterStructure;
    hasChildFilters(): boolean;
    clear(name?: string): void;
    or(filter: Filter | FilterStructure, name?: string): FilterStructure;
    and(filter: Filter | FilterStructure, name?: string): FilterStructure;
    get(field: string): Filter | FilterStructure;
    getFilter(field: string): Filter;
    getFilterStructure(field: string): FilterStructure;
    delete(filter: string | Filter | FilterStructure): boolean;
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    getBindValues(): BindValue[];
    private build;
    getFilters(start?: FilterStructure): Filter[];
    printable(): Printable;
    toString(): string;
}
export declare class Printable {
    entries: any[];
}
