import { Class } from "../../public/Class.js";
import { FieldImplementation } from "./interfaces/FieldImplementation.js";
export declare class FieldTypes {
    private static implementations;
    private static init;
    static get(tag: string, type?: string): Class<FieldImplementation>;
}
