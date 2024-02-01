import { Record } from "../Record.js";
import { DataType } from "../../database/DataType.js";
import { BindValue } from "../../database/BindValue.js";
/**
 * Filters is a key component when communicating with a backend.
 *
 * To write a filter just implement this interface.
 * In most cases extending an existing filter is easier.
 */
export interface Filter {
    clear(): void;
    asSQL(): string;
    clone(): Filter;
    column: string;
    constraint: any | any[];
    getBindValue(): BindValue;
    getBindValues(): BindValue[];
    getBindValueName(): string;
    setBindValueName(name: string): Filter;
    getDataType(): string;
    setDataType(type: DataType): Filter;
    setConstraint(value: any | any[]): Filter;
    evaluate(record: Record): Promise<boolean>;
}
