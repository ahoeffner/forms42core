export declare class SQLCache {
    private static cache$;
    static get(sql: string, maxage?: number): any;
    static put(sql: string, response: any): void;
    clear(): void;
}
