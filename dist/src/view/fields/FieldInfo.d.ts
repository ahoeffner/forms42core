import { DataType } from "./DataType.js";
export declare class FieldInfo {
    type: DataType;
    query: boolean;
    derived: boolean;
    constructor(type: DataType, query: boolean, derived: boolean);
}
