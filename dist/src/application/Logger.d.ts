export declare enum Type {
    metadata = 0,
    database = 1,
    htmlparser = 2,
    eventparser = 3,
    classloader = 4,
    formbinding = 5,
    eventhandling = 6,
    eventlisteners = 7
}
/**
 * The Logger class is meant for debugging the code.
 */
export declare class Logger {
    static all: boolean;
    static metadata: boolean;
    static database: boolean;
    static htmlparser: boolean;
    static eventparser: boolean;
    static classloader: boolean;
    static formbinding: boolean;
    static eventhandling: boolean;
    static eventlisteners: boolean;
    static log(type: Type, msg: string): void;
}
