import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The ILike filter resembles the case-insensitive ilike operator in SQL.
 */
export declare class ILike implements Filter {
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
    clone(): ILike;
    getDataType(): string;
    setDataType(type: DataType | string): ILike;
    getBindValueName(): string;
    setBindValueName(name: string): ILike;
    setConstraint(value: any): ILike;
    get constraint(): string;
    set constraint(value: string);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
    toString(): string;
}
