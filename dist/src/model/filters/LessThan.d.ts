import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The LessThan filter resembles the < and <= operator in SQL.
 */
export declare class LessThan implements Filter {
    private constraint$;
    private incl;
    private column$;
    private bindval$;
    private datatype$;
    private bindvalues$;
    constructor(column: string, incl?: boolean);
    clear(): void;
    get includes(): boolean;
    set includes(flag: boolean);
    get column(): string;
    set column(column: string);
    clone(): LessThan;
    getDataType(): string;
    setDataType(type: DataType | string): LessThan;
    getBindValueName(): string;
    setBindValueName(name: string): LessThan;
    setConstraint(value: any): LessThan;
    get constraint(): any;
    set constraint(value: any);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
