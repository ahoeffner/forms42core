import { Row } from "./Row.js";
import { Record } from "../model/Record.js";
import { BasicProperties } from "./fields/BasicProperties.js";
export declare class RecordProperties {
    propmap$: Map<object, Map<string, Map<string, BasicProperties>>>;
    clear(): void;
    get(record: Record, field: string, clazz: string): BasicProperties;
    set(record: Record, field: string, clazz: string, props: BasicProperties): void;
    delete(record: Record, field: string, clazz: string): void;
    reset(row: Row, field?: string, clazz?: string): void;
    apply(row: Row, record: Record, field?: string): void;
}
