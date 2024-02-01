import { DataType } from "./DataType.js";
/**
 * Parameter types, mostly used with database
 * stored proedures/functions
 */
export declare enum ParameterType {
    in = 0,
    out = 1,
    inout = 2
}
/**
 * Parameter, mostly used with database
 * stored proedures/functions
 */
export declare class Parameter {
    value: any;
    name: string;
    dtype: string;
    ptype: ParameterType;
    /**
     *
     * @param name  : name
     * @param value : value
     * @param dtype : data type
     * @param ptype : parameter type i.e. in, out, in/out
     */
    constructor(name: string, value: any, dtype?: DataType | string, ptype?: ParameterType);
}
