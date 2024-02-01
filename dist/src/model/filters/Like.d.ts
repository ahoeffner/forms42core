import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The Like filter resembles the like operator in SQL.
 */
export declare class Like implements Filter {
    private column$;
    private bindval$;
    private ltrunc;
    private rtrunc;
    private parsed;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): Like;
    getDataType(): string;
    setDataType(type: DataType | string): Like;
    getBindValueName(): string;
    setBindValueName(name: string): Like;
    setConstraint(value: any): Like;
    get constraint(): string;
    set constraint(value: string);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
