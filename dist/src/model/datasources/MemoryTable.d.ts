import { Filter } from "../interfaces/Filter.js";
import { Record } from "../Record.js";
import { FilterStructure } from "../FilterStructure.js";
import { DataSource, LockMode } from "../interfaces/DataSource.js";
export declare class MemoryTable implements DataSource {
    name: string;
    arrayfecth: number;
    rowlocking: LockMode;
    queryallowed: boolean;
    insertallowed: boolean;
    updateallowed: boolean;
    deleteallowed: boolean;
    private pos$;
    private order$;
    private dirty$;
    private columns$;
    private records$;
    private sorting$;
    private limit$;
    private filter;
    /**
     * Datasource based on data in memory
     */
    /**
     * @param columns: columns in the table
     * @param records : number of records or actual data
     */
    constructor(columns?: string | string[], records?: number | any[][]);
    /** Clear all records */
    clear(): void;
    /** Memory source is not transactional */
    get transactional(): boolean;
    /** Set table data */
    setData(data: any[][]): void;
    /** Clones the datasource */
    clone(columns?: string | string[]): MemoryTable;
    /** Sorting (works like order by) */
    get sorting(): string;
    /** Sorting (works like order by) */
    set sorting(order: string);
    /** The columns used by this datasource */
    get columns(): string[];
    /** Add columns used by this datasource */
    addColumns(columns: string | string[]): MemoryTable;
    /** Remove columns used by this datasource */
    removeColumns(columns: string | string[]): MemoryTable;
    /** Return the default filters */
    getFilters(): FilterStructure;
    /** Add a default filter */
    addFilter(filter: Filter | FilterStructure): MemoryTable;
    /** Not applicable for this type of datasource */
    lock(_record: Record): Promise<boolean>;
    /** Undo changes */
    undo(): Promise<Record[]>;
    /** Flush changes to datasource */
    flush(): Promise<Record[]>;
    /** Re-fetch the given record from memory */
    refresh(record: Record): Promise<boolean>;
    /** Create a record for inserting a row in the table */
    insert(record: Record): Promise<boolean>;
    /** Mark a record for updating a row in the table */
    update(record: Record): Promise<boolean>;
    /** Mark a record for deleting a row in the table */
    delete(record: Record): Promise<boolean>;
    /** Execute the query */
    query(filter?: FilterStructure): Promise<boolean>;
    /** Fetch a set of records */
    fetch(): Promise<Record[]>;
    /** Cursers is not used with this datasource */
    closeCursor(): Promise<boolean>;
    private indexOf;
}
