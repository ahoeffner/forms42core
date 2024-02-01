import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The IsNull filter resembles the 'is null' operator in SQL.
 */
export declare class IsNull implements Filter {
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): IsNull;
    getDataType(): string;
    setDataType(type: DataType | string): IsNull;
    getBindValueName(): string;
    setBindValueName(name: string): IsNull;
    setConstraint(value: any): IsNull;
    get constraint(): any | any[];
    set constraint(value: any | any[]);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
}
