import { SQLRest } from "./SQLRest.js";
import { DataType } from "./DataType.js";
import { SQLSource } from "./SQLSource.js";
import { Filter } from "../model/interfaces/Filter.js";
import { Record } from "../model/Record.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
import { DataSource, LockMode } from "../model/interfaces/DataSource.js";
/**
 * Datasource based on a table/view using OpenRestDB
 */
export declare class DatabaseTable extends SQLSource implements DataSource {
    name: string;
    arrayfecth: number;
    queryallowed: boolean;
    insertallowed: boolean;
    updateallowed: boolean;
    deleteallowed: boolean;
    rowlocking: LockMode;
    private dirty$;
    private described$;
    private table$;
    private order$;
    private cursor$;
    private columns$;
    private primary$;
    private dmlcols$;
    private fetched$;
    private conn$;
    private nosql$;
    private limit$;
    private pubconn$;
    private insreturncolumns$;
    private updreturncolumns$;
    private delreturncolumns$;
    private datatypes$;
    /**
     *  @param connection : OpenRestDB connection to a database
     *  @param table : Database table/view
     *  @param columns : Columns from the table/view
     */
    constructor(connection: DatabaseConnection, table: string, columns?: string | string[]);
    /** Set the table/view */
    set table(table: string);
    /** Whether the datasource is transactional */
    get transactional(): boolean;
    /** Closes backend cursor */
    clear(): void;
    /** Clones the datasource */
    clone(): DatabaseTable;
    /** The order by clause */
    get sorting(): string;
    /** The order by clause */
    set sorting(order: string);
    /** The columns used by this datasource */
    get columns(): string[];
    /** Set the column names involved */
    set columns(columns: string | string[]);
    /** Get the primary key defined for this datasource */
    get primaryKey(): string[];
    /** Set the primary key for this datasource */
    set primaryKey(columns: string | string[]);
    /** Force a datatype */
    setDataType(column: string, type: DataType | string): DatabaseTable;
    /** Get columns defined for 'returning' after insert */
    get insertReturnColumns(): string[];
    /** Set columns defined for 'returning' after insert */
    set insertReturnColumns(columns: string | string[]);
    /** Get columns defined for 'returning' after update */
    get updateReturnColumns(): string[];
    /** Set columns defined for 'returning' after update */
    set updateReturnColumns(columns: string | string[]);
    /** Get columns defined for 'returning' after delete */
    get deleteReturnColumns(): string[];
    /** Set columns defined for 'returning' after delete */
    set deleteReturnColumns(columns: string | string[]);
    /** Add additional columns participating in insert, update and delete */
    addDMLColumns(columns: string | string[]): void;
    /** Add columns participating in all operations on the table/view */
    addColumns(columns: string | string[]): DatabaseTable;
    /** Remove columns participating in all operations on the table/view */
    removeColumns(columns: string | string[]): DatabaseTable;
    /** Return the default filters */
    getFilters(): FilterStructure;
    /** Add a default filter */
    addFilter(filter: Filter | FilterStructure): DatabaseTable;
    /** Lock the given record in the database */
    lock(record: Record): Promise<boolean>;
    /** Undo not flushed changes */
    undo(): Promise<Record[]>;
    /** Flush changes to backend */
    flush(): Promise<Record[]>;
    /** Re-fetch the given record from the backend */
    refresh(record: Record): Promise<boolean>;
    /** Create a record for inserting a row in the table/view */
    insert(record: Record): Promise<boolean>;
    /** Mark a record for updating a row in the table/view */
    update(record: Record): Promise<boolean>;
    /** Mark a record for deleting a row in the table/view */
    delete(record: Record): Promise<boolean>;
    /** Get the query as a subquery */
    getSubQuery(filter: FilterStructure, mstcols: string | string[], detcols: string | string[]): Promise<SQLRest>;
    /** Execute the query */
    query(filter?: FilterStructure): Promise<boolean>;
    /** Fetch a set of records */
    fetch(): Promise<Record[]>;
    /** Close the database cursor */
    closeCursor(): Promise<boolean>;
    private createCursor;
    private filter;
    private describe;
    private setTypes;
    private parse;
    private castResponse;
    private process;
    private mergeColumns;
}
