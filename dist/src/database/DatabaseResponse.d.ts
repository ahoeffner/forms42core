/**
 * When doing DML on a database table using OpenRestDB the response
 * from the database is parsed into a DatabaseResponse
 */
export declare class DatabaseResponse {
    private response$;
    private columns$;
    private converted$;
    constructor(response: any, columns?: string[]);
    /** Whether the statement failed */
    get failed(): boolean;
    /** Get the value of a responed column when using 'returning' */
    getValue(column: string): any;
}
