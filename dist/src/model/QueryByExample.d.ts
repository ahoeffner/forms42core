import { Block } from "./Block.js";
import { Filter } from "./interfaces/Filter.js";
import { Record } from "./Record.js";
import { FilterStructure } from "./FilterStructure.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";
export declare class QueryByExample {
    private block$;
    private record$;
    private qmode$;
    private table$;
    private wrapper$;
    private filter$;
    private lastqry$;
    constructor(block: Block);
    get querymode(): boolean;
    set querymode(flag: boolean);
    clear(): void;
    showLastQuery(): void;
    get record(): Record;
    get wrapper(): DataSourceWrapper;
    get filters(): FilterStructure;
    setFilter(column: string, filter?: Filter | FilterStructure): void;
    getDefaultFilter(column: string): Filter;
}
