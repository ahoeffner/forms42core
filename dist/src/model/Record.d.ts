import { Block } from "./Block.js";
import { DataSource } from "./interfaces/DataSource.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";
/**
 * The state of a record.
 *
 * Records goes through different states, depending on
 * the user actions, the datasource and the type of connection.
 *
 */
export declare enum RecordState {
    New = 0,
    Insert = 1,
    Inserted = 2,
    Delete = 3,
    Deleted = 4,
    Update = 5,
    Updated = 6,
    Consistent = 7,
    QueryFilter = 8
}
export declare class Record {
    private id$;
    private values$;
    private initial$;
    private response$;
    private failed$;
    private locked$;
    private flushing$;
    private source$;
    private prepared$;
    private initiated$;
    private wrapper$;
    private dirty$;
    private status$;
    constructor(source: DataSource, data?: any[]);
    get id(): any;
    get block(): Block;
    get initiated(): boolean;
    set initiated(flag: boolean);
    get deleted(): boolean;
    get updated(): boolean;
    get inserted(): boolean;
    clear(): void;
    setClean(release: boolean): void;
    cleanup(): void;
    get source(): DataSource;
    get response(): any;
    set response(response: any);
    get wrapper(): DataSourceWrapper;
    set wrapper(wrapper: DataSourceWrapper);
    get locked(): boolean;
    set locked(flag: boolean);
    get failed(): boolean;
    set failed(flag: boolean);
    get prepared(): boolean;
    set prepared(flag: boolean);
    get synched(): boolean;
    get flushing(): boolean;
    set flushing(flag: boolean);
    get values(): {
        name: string;
        value: any;
    }[];
    get state(): RecordState;
    set state(status: RecordState);
    get dirty(): boolean;
    get clean(): boolean;
    refresh(): void;
    getValue(column: string): any;
    getInitialValue(column: string): any;
    setValue(column: string, value: any): void;
    getDirty(): string[];
    setDirty(column?: string): void;
    get columns(): string[];
    private indexOf;
    private column;
    toString(): string;
    private initialize;
}
