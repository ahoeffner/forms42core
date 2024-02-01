import { SQLRest } from "./SQLRest.js";
import { DataType } from "./DataType.js";
import { BindValue } from "./BindValue.js";
import { SQLSource } from "./SQLSource.js";
import { Record } from "../model/Record.js";
import { Filter } from "../model/interfaces/Filter.js";
import { FilterStructure } from "../model/FilterStructure.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
import { DataSource, LockMode } from "../model/interfaces/DataSource.js";
/**
 * Datasource based on a query using OpenRestDB
 */
export declare class QueryTable extends SQLSource implements DataSource {
    name: string;
    arrayfecth: number;
    queryallowed: boolean;
    rowlocking: LockMode;
    private described$;
    private sql$;
    private order$;
    private cursor$;
    private where$;
    private columns$;
    private fetched$;
    private conn$;
    private bindings$;
    private nosql$;
    private limit$;
    private pubconn$;
    private datatypes$;
    /** @param connection : OpenRestDB connection to a database, @param sql : a query */
    constructor(connection: DatabaseConnection, sql?: string);
    /** The query */
    set sql(sql: string);
    /** Whether the datasource is transactional */
    get transactional(): boolean;
    /** Closes backend cursor */
    clear(): void;
    /** Clones the datasource */
    clone(): QueryTable;
    /** The order by clause */
    get sorting(): string;
    /** The order by clause */
    set sorting(order: string);
    /** Get the column names returned from the query */
    get columns(): string[];
    /** Insert is not allowed on this source */
    get insertallowed(): boolean;
    /** Update is not allowed on this source */
    get updateallowed(): boolean;
    /** Delete is not allowed on this source */
    get deleteallowed(): boolean;
    /** When adding filters, start with where or and */
    startWithWhere(flag: boolean): void;
    /** Force a datatype */
    setDataType(column: string, type: DataType): QueryTable;
    /** Not possible on this datasource */
    addColumns(_columns: string | string[]): QueryTable;
    /** Not possible on this datasource */
    removeColumns(_columns: string | string[]): QueryTable;
    /** Return the default filters */
    getFilters(): FilterStructure;
    /** Add a default filter */
    addFilter(filter: Filter | FilterStructure): QueryTable;
    /** Add a bindvalue */
    addBindValue(bindvalue: BindValue): void;
    /** Not possible on this datasource */
    lock(_record: Record): Promise<boolean>;
    /** Not possible on this datasource */
    undo(): Promise<Record[]>;
    /** Not possible on this datasource */
    flush(): Promise<Record[]>;
    /** Re-fetch the given record from the backend */
    refresh(record: Record): Promise<boolean>;
    /** Not possible on this datasource */
    insert(_record: Record): Promise<boolean>;
    /** Not possible on this datasource */
    update(_record: Record): Promise<boolean>;
    /** Not possible on this datasource */
    delete(_record: Record): Promise<boolean>;
    /** Not possible on this datasource */
    getSubQuery(_filter: FilterStructure, _mstcols: string | string[], _detcols: string | string[]): Promise<SQLRest>;
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
}
