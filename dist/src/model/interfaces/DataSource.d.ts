import { Filter } from './Filter.js';
import { Record } from '../Record.js';
import { FilterStructure } from '../FilterStructure.js';
/** Lock strategy */
export declare enum LockMode {
    None = 0,
    Optimistic = 1,
    Pessimistic = 2
}
/**
 * Definition of a datasource.
 * Any class implementing this interface
 * can be used as a datasource.
 */
export interface DataSource {
    name: string;
    sorting: string;
    columns: string[];
    arrayfecth: number;
    rowlocking: LockMode;
    queryallowed: boolean;
    insertallowed: boolean;
    updateallowed: boolean;
    deleteallowed: boolean;
    transactional: boolean;
    clear(): void;
    clone(): DataSource;
    undo(): Promise<Record[]>;
    fetch(): Promise<Record[]>;
    flush(): Promise<Record[]>;
    closeCursor(): Promise<boolean>;
    lock(record: Record): Promise<boolean>;
    insert(record: Record): Promise<boolean>;
    update(record: Record): Promise<boolean>;
    delete(record: Record): Promise<boolean>;
    refresh(record: Record): Promise<boolean>;
    query(filters?: FilterStructure): Promise<boolean>;
    getFilters(): FilterStructure;
    addColumns(columns: string | string[]): DataSource;
    removeColumns(columns: string | string[]): DataSource;
    addFilter(filter: Filter | FilterStructure): DataSource;
}
