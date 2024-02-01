import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 *
 * The CustomFilter is a 'scaffolding' class only meant for extending
 * into a functional filter in an easy way.
 */
export declare class CustomFilter implements Filter {
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): CustomFilter;
    getDataType(): string;
    setDataType(type: DataType | string): CustomFilter;
    getBindValueName(): string;
    setBindValueName(name: string): CustomFilter;
    setConstraint(values: any | any[]): CustomFilter;
    get constraint(): any | any[];
    set constraint(values: any | any[]);
    getBindValue(): BindValue;
    setBindValues(values: BindValue[]): void;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
