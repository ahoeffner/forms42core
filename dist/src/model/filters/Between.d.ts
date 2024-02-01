import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The Between filter resembles the between operator in SQL.
 */
export declare class Between implements Filter {
    private incl;
    private column$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(column: string, incl?: boolean);
    clear(): void;
    get includes(): boolean;
    set includes(flag: boolean);
    get column(): string;
    set column(column: string);
    clone(): Between;
    getDataType(): string;
    setDataType(type: DataType | string): Between;
    getBindValueName(): string;
    setBindValueName(name: string): Between;
    setConstraint(values: any[]): Between;
    get constraint(): any | any[];
    set constraint(values: any[]);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
