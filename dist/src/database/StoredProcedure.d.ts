import { DataType } from "./DataType.js";
import { ParameterType } from "./Parameter.js";
import { DatabaseConnection } from "../public/DatabaseConnection.js";
/**
 * StoredProcedure is used with OpenRestDB to execute
 * a stored procedure
 */
export declare class StoredProcedure {
    private name$;
    private response$;
    private patch$;
    private message$;
    private conn$;
    private params$;
    private values$;
    private datetypes$;
    protected retparm$: string;
    protected returntype$: DataType | string;
    /** @param connection : A connection to OpenRestDB */
    constructor(connection: DatabaseConnection);
    /** If the procedure changes any values the backend */
    set patch(flag: boolean);
    /** The error message from the backend */
    error(): string;
    /** The name of the stored procedure */
    setName(name: string): void;
    /** Add call parameter */
    addParameter(name: string, value: any, datatype?: DataType | string, paramtype?: ParameterType): void;
    /** Get out parameter */
    getOutParameter(name: string): any;
    /** Get out parameter names */
    getOutParameterNames(): string[];
    /** Execute the procedure */
    execute(): Promise<boolean>;
}
