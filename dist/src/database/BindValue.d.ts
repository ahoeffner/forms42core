import { DataType } from "./DataType.js";
/**
 * Bind values is meant for use with datasources, espicially databases
 * where they act as a placeholder for a given value. Bind values can be
 * both as one-way in or two-way in/out.
 *
 * When used with OpenRestDB the data type is determined by the table column
 * it is bound to (initially same as name). However it is not always possible
 * to determine the datatype based on the datasource.
 *
 * In rare cases it is necessary to force or cast the data type to a different
 * type than the datasource's default data type.
 */
export declare class BindValue {
    private value$;
    private name$;
    private type$;
    private out$;
    private column$;
    private force$;
    /**
     *
     * @param name  : name
     * @param value : value
     * @param type  : type, if not automatically detected
     */
    constructor(name: string, value: any, type?: DataType | string);
    /** Name of bind value */
    get name(): string;
    /** Name of bind value */
    set name(name: string);
    /** Column to bind to */
    get column(): string;
    /** Column to bind to */
    set column(column: string);
    /** Whether it is used as an out parameter */
    get outtype(): boolean;
    /** Whether it is used as an out parameter */
    set outtype(flag: boolean);
    /** The datatype */
    get type(): string;
    /** The datatype */
    set type(type: DataType | string);
    /** Whether to force/cast the type */
    get forceDataType(): boolean;
    /** Whether to force/cast the type */
    set forceDataType(flag: boolean);
    /** The value */
    get value(): any;
    /** The value */
    set value(value: any);
    toString(): string;
}
