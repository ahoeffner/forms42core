import { SQLRest } from "./SQLRest.js";
import { BindValue } from "./BindValue.js";
import { Record } from "../model/Record.js";
import { Parameter } from "./Parameter.js";
import { FilterStructure } from "../model/FilterStructure.js";
export declare class SQLRestBuilder {
    static proc(name: string, parameters: Parameter[], retparam: Parameter): SQLRest;
    static select(table: string, columns: string[], filter: FilterStructure, order: string): SQLRest;
    static finish(sql: string, where: boolean, filter: FilterStructure, bindings: BindValue[], order: string): SQLRest;
    static lock(table: string, pkey: string[], columns: string[], record: Record): SQLRest;
    static refresh(table: string, pkey: string[], columns: string[], record: Record): SQLRest;
    static fetch(cursor: string): SQLRest;
    static insert(table: string, columns: string[], record: Record, returncolumns: string[]): SQLRest;
    static update(table: string, pkey: string[], columns: string[], record: Record, returncolumns: string[]): SQLRest;
    static delete(table: string, pkey: string[], record: Record, returncolumns: string[]): SQLRest;
    static subquery(table: string, mstcols: string[], detcols: string[], filter: FilterStructure): SQLRest;
    static assert(sql: SQLRest, columns: string[], record: Record): void;
}
