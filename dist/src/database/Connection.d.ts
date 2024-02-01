import { Cursor } from "./Cursor.js";
import { SQLRest } from "./SQLRest.js";
import { ConnectionScope } from "./ConnectionScope.js";
import { Connection as BaseConnection } from "../public/Connection.js";
export declare class Connection extends BaseConnection {
    private locks$;
    private trx$;
    private conn$;
    private touched$;
    private modified$;
    private keepalive$;
    private nowait$;
    private running$;
    private tmowarn$;
    private authmethod$;
    private autocommit$;
    private attributes$;
    private clientinfo$;
    private scope$;
    static MAXLOCKS: number;
    static TRXTIMEOUT: number;
    static LOCKINSPECT: number;
    static CONNTIMEOUT: number;
    private static conns$;
    static getAllConnections(): Connection[];
    constructor(url?: string | URL);
    get locks(): number;
    set locks(locks: number);
    get scope(): ConnectionScope;
    set scope(scope: ConnectionScope);
    get authmethod(): string;
    set authmethod(method: string);
    get transactional(): boolean;
    addAttribute(name: string, value: any): void;
    deleteAttribute(name: string): void;
    addClientInfo(name: string, value: any): void;
    deleteClientInfo(name: string): void;
    connected(): boolean;
    hasTransactions(): boolean;
    hasKeepAlive(): boolean;
    connect(username?: string, password?: string, custom?: Map<string, any>): Promise<boolean>;
    disconnect(): Promise<boolean>;
    commit(): Promise<boolean>;
    rollback(): Promise<boolean>;
    release(): Promise<boolean>;
    select(sql: SQLRest, cursor: Cursor, rows: number, describe?: boolean): Promise<Response>;
    fetch(cursor: Cursor): Promise<Response>;
    close(cursor: Cursor): Promise<Response>;
    lock(sql: SQLRest): Promise<Response>;
    refresh(sql: SQLRest): Promise<Response>;
    insert(sql: SQLRest): Promise<Response>;
    update(sql: SQLRest): Promise<Response>;
    script(steps: Step[], attributes?: {
        name: string;
        value: object;
    }[]): Promise<any>;
    batch(stmts: Step[], attributes?: {
        name: string;
        value: object;
    }[]): Promise<any[]>;
    delete(sql: SQLRest): Promise<Response>;
    call(patch: boolean, sql: SQLRest): Promise<Response>;
    execute(patch: boolean, sql: SQLRest): Promise<Response>;
    private get trx();
    private set trx(value);
    private get tmowarn();
    private set tmowarn(value);
    private get touched();
    private set touched(value);
    private get modified();
    private set modified(value);
    private keepalive;
    private convert;
}
export declare class Response {
    rows: any[];
    message: string;
    success: boolean;
}
export declare class Step extends SQLRest {
    path: string;
}
