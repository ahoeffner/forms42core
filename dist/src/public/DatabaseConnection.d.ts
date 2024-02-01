import { SQLRest } from "../database/SQLRest.js";
import { ConnectionScope } from "../database/ConnectionScope.js";
import { Step } from "../database/Connection.js";
/**
 * Connection to DatabaseJS.
 */
export declare class DatabaseConnection {
    private conn$;
    /** Lock limit, scope != stateless
    *
    *
    * @public
   * @returns The maximum number of locks.
    */
    static get MAXLOCKS(): number;
    /** Lock limit, scope != stateless
    *
    *
   * @public
   * @param timeout - The timeout value to set.
    */
    static set MAXLOCKS(timeout: number);
    /** Transaction timeout in seconds, only with scope=transactional
    *
    *
   * @public
   * @returns The transaction timeout in seconds.
    */
    static get TRXTIMEOUT(): number;
    /** Transaction timeout in seconds, only with scope=transactional
    *
    * @public
   * @param timeout - The timeout value to set.
    */
    static set TRXTIMEOUT(timeout: number);
    /** Lock inspection interval in seconds, only with scope!=stateless
    *
   * @public
   * @returns The lock inspection interval in seconds.
   */
    static get LOCKINSPECT(): number;
    /** Lock inspection interval in seconds, only with scope!=stateless
    *
    *
   * @public
   * @param timeout - The timeout value to set.
   */
    static set LOCKINSPECT(timeout: number);
    /** Connection timeout in seconds, only with scope=transactional
    *
   * @public
   * @returns The connection timeout in seconds.
   */
    static get CONNTIMEOUT(): number;
    /** Connection timeout in seconds, only with scope=transactional
    *
    *
   * @public
   * @param timeout - The timeout value to set.
   */
    static set CONNTIMEOUT(timeout: number);
    /** See connection
    *
   * @public
   * @constructor
   * @param url - The URL of the database.
   */
    constructor(url?: string | URL);
    /** Number of row locks
    *
   * @public
   * @returns The number of row locks.
   */
    get locks(): number;
    /** Number of row locks
    *
   * @public
   * @param locks - The number of row locks to set.
   */
    set locks(locks: number);
    /** The connection scope
    *
   * @public
   * @returns The connection scope.
   */
    get scope(): ConnectionScope;
    /** The connection scope
    *
    * @public
    * @param scope - The connection scope to set.
    */
    set scope(scope: ConnectionScope);
    /** The authorization method
    *
   * @public
   * @returns The authorization method.
   */
    get authmethod(): string;
    /** The authorization method  *
    *
   * @public
   * @param method - The authorization method to set.
   */
    set authmethod(method: string);
    /** Is connection scope transactional
    *
   * @public
   * @returns A boolean indicating whether the connection scope is transactional.
   */
    get transactional(): boolean;
    /** Add attribute to be passed on to backend
    *
   * @public
   * @param name - The name of the attribute.
   * @param value - The value of the attribute.
   */
    addAttribute(name: string, value: any): void;
    /** Delete attribute to be passed on to backend
    *
    *
   * @public
   * @param name - The name of the attribute to delete.
   */
    deleteAttribute(name: string): void;
    /** Add clientinfo to be passed on to database
    *
   * @public
   * @param name - The name of the client info.
   * @param value - The value of the client info.
   */
    addClientInfo(name: string, value: any): void;
    /** Delete clientinfo to be passed on to database
    *
   * @public
   * @param name - The name of the client info to delete.
   */
    deleteClientInfo(name: string): void;
    /** Connects to the database.
   *
   * @public
   * @param username - The username for the database connection.
   * @param password - The password for the database connection.
   * @param custom - Custom data for the connection.
   * @returns A promise that resolves to a boolean indicating the success of the connection.
   */
    connect(username?: string, password?: string, custom?: Map<string, any>): Promise<boolean>;
    /**
   * Disconnects from the database.
   *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the disconnection.
   */
    disconnect(): Promise<boolean>;
    /** Is connected to database
    *
   * @public
   * @returns A boolean indicating whether the connection is established.
   */
    connected(): boolean;
    /** Commit all transactions
    *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the commit.
   */
    commit(): Promise<boolean>;
    /** Rollback all transactions  *
    *
   * @public
   * @returns A promise that resolves to a boolean indicating the success of the rollback.
   */
    rollback(): Promise<boolean>;
    /** Execute insert    *
   * @public
   * @param payload - The SQLRest payload for the insert operation.
   * @returns A promise that resolves to the result of the insert operation.
   */
    insert(payload: SQLRest): Promise<any>;
    /** Execute update   *
    *
   * @public
   * @param payload - The SQLRest payload for the update operation.
   * @returns A promise that resolves to the result of the update operation.
   */
    update(payload: SQLRest): Promise<any>;
    /** Execute delete
    *
   * @public
   * @param payload - The SQLRest payload for the delete operation.
   * @returns A promise that resolves to the result of the delete operation.
   */
    delete(payload: SQLRest): Promise<any>;
    /** Execute script
    * Executes a script.
   *
   * @public
   * @param steps - The steps of the script.
   * @param attributes - Additional attributes for the script.
   * @returns A promise that resolves to the result of the script.
   */
    script(steps: Step[], attributes?: {
        name: string;
        value: object;
    }[]): Promise<any>;
    /** Execute batch   *
   * @public
   * @param stmts - The statements to execute in a batch.
   * @param attributes - Additional attributes for the batch.
   * @returns A promise that resolves to an array of results for each statement in the batch.
   */
    batch(stmts: Step[], attributes?: {
        name: string;
        value: object;
    }[]): Promise<any[]>;
}
