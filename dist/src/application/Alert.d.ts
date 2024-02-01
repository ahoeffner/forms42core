import { Alert as Interceptor } from '../application/interfaces/Alert.js';
/**
 * A popup form to alert the user that some event
 * has occured
 */
export declare class Alert {
    static interceptor: Interceptor;
    /** Alert the user that a fatal event has occured */
    static fatal(msg: string, title: string): Promise<void>;
    /** Alert the user that an event causing an warning has occured */
    static warning(msg: string, title: string): Promise<void>;
    /** Alert the user an event has occured */
    static message(msg: string, title: string): Promise<void>;
    private static callform;
}
