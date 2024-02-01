import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
export declare class NoneOf implements Filter {
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string);
    clear(): void;
    get column(): string;
    set column(column: string);
    clone(): NoneOf;
    getDataType(): string;
    setDataType(type: DataType | string): NoneOf;
    getBindValueName(): string;
    setBindValueName(name: string): NoneOf;
    setConstraint(values: any | any[]): NoneOf;
    get constraint(): any | any[];
    set constraint(table: any | any[]);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(lenght?: number): string;
    private quoted;
}
