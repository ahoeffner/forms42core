import { Record } from "../Record.js";
import { Filter } from "../interfaces/Filter.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 * The Contains filter is meant for text-queries. Contains is not
 * part of standard SQL and should be extended when used on a database
 * datasource
 */
export declare class Contains implements Filter {
    private columns$;
    private bindval$;
    private datatype$;
    private constraint$;
    private bindvalues$;
    constructor(columns: string | string[]);
    clear(): void;
    get column(): string;
    set column(column: string);
    get columns(): string[];
    set columns(columns: string[]);
    clone(): Contains;
    getDataType(): string;
    setDataType(type: DataType | string): Contains;
    getBindValueName(): string;
    setBindValueName(name: string): Filter;
    setConstraint(values: any): Contains;
    get constraint(): string | string[];
    set constraint(values: string | string[]);
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    evaluate(record: Record): Promise<boolean>;
    asSQL(): string;
}
