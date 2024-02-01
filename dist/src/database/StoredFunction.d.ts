import { DataType } from "./DataType.js";
import { StoredProcedure } from "./StoredProcedure.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
/**
 * StoredFunction is used with OpenRestDB to call
 * a stored function
 */
export declare class StoredFunction extends StoredProcedure {
    /** @param connection : A connection to OpenRestDB */
    constructor(connection: DatabaseConnection);
    /** Get the name of returned parameter from the function call */
    getReturnValue(): string;
    /** Set the return data type */
    setReturnType(datatype?: DataType | string): void;
}
