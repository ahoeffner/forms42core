import { DataType } from "./DataType.js";
import { BindValue } from "./BindValue.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
/**
 * SQLStatement is used with OpenRestDB to execute any
 * sql-statement
 */
export declare class SQLStatement {
    static AutoDetectReurning: RegExp;
    private pos;
    private sql$;
    private type$;
    private response$;
    private types;
    private cursor$;
    private patch$;
    private message$;
    private arrayfecth$;
    private records$;
    private conn$;
    private columns$;
    private returning$;
    private retvals;
    private bindvalues$;
    /** @param connection : A connection to OpenRestDB */
    constructor(connection: DatabaseConnection);
    /** The sql-statement */
    get sql(): string;
    /** The sql-statement */
    set sql(sql: string);
    /** If the statement changes any values the backend */
    set patch(flag: boolean);
    /** The columns involved in a select statement */
    get columns(): string[];
    /** If used with sql-extension 'returning' */
    get returnvalues(): boolean;
    /** If used with sql-extension 'returning' */
    set returnvalues(flag: boolean);
    /** The number of rows to fetch from a select-statement per call to fetch */
    get arrayfetch(): number;
    /** The number of rows to fetch from a select-statement per call to fetch */
    set arrayfetch(size: number);
    /** The error message from the backend */
    error(): string;
    /** Bind datatype */
    setDataType(name: string, type?: DataType | string): void;
    /** Bind values defined with colon i.e. salary = :salary */
    bind(name: string, value: any, type?: DataType | string): void;
    /** Bind values defined with colon i.e. salary = :salary */
    addBindValue(bindvalue: BindValue): void;
    /** Execute the statement */
    execute(): Promise<boolean>;
    /** Fetch rows, if select statement */
    fetch(): Promise<any[]>;
    /** Get return value if 'returning' */
    getReturnValue(column: string, type?: DataType | string): any;
    /** Close and clean up */
    close(): Promise<boolean>;
    private parse;
}
