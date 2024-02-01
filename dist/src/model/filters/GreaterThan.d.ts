import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The GreaterThan filter resembles the > and >= operator in SQL.
 */
export declare class GreaterThan implements Filter {
    private incl;
    private column$;
    private bindval$;
    private constraint$;
    private datatype$;
    private bindvalues$;
    constructor(column: string, incl?: boolean);
    clear(): void;
    get includes(): boolean;
    set includes(flag: boolean);
    get column(): string;
    set column(column: string);
    clone(): GreaterThan;
    getDataType(): string;
    setDataType(type: DataType | string): GreaterThan;
    getBindValueName(): string;
    setBindValueName(name: string): GreaterThan;
    setConstraint(value: any): GreaterThan;
    get constraint(): any;
    set constraint(value: any);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
