import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The AnyOf filter resembles the in operator in SQL.
 */
export declare class AnyOf implements Filter {
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): AnyOf;
    getDataType(): string;
    setDataType(type: DataType | string): AnyOf;
    getBindValueName(): string;
    setBindValueName(name: string): AnyOf;
    setConstraint(values: any | any[]): AnyOf;
    get constraint(): any | any[];
    set constraint(table: any | any[]);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(lenght?: number): string;
    private quoted;
}
