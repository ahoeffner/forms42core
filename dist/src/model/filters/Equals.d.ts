import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The Equals filter resembles the = operator in SQL.
 */
export declare class Equals implements Filter {
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): Equals;
    getDataType(): string;
    setDataType(type: DataType | string): Equals;
    getBindValueName(): string;
    setBindValueName(name: string): Equals;
    setConstraint(value: any): Equals;
    get constraint(): any;
    set constraint(value: any);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
