import { Group } from "./interfaces/Group.js";
import { Bundle } from "./interfaces/Bundle.js";
import { Message } from "./interfaces/Message.js";
import { Class } from "../public/Class.js";
import { MessageHandler } from "./MessageHandler.js";
export declare class Messages {
    private static alert$;
    private static console$;
    private static files$;
    private static language$;
    private static handler$;
    private static groups$;
    private static messages$;
    /** Level at which messages are alerted */
    static get alertLevel(): Level;
    /** Level at which messages are alerted */
    static set alertLevel(level: Level);
    /** Level at which messages written to console */
    static get consoleLevel(): Level;
    /** Level at which messages written to console */
    static set consoleLevel(level: Level);
    /** Interceptor for handling messages */
    static get MessageHandler(): MessageHandler;
    /** Interceptor for handling messages */
    static set MessageHandler(handler: MessageHandler);
    /** all messages language */
    static set language(language: string);
    /** all messages language */
    static get language(): string;
    /** Add message bundle */
    static addBundle(bundle: Bundle | Class<Bundle>): void;
    /** Get message by group# and message# */
    static get(grpno: number, errno: number): Message;
    /** Get message group by group# */
    static getGroup(grpno: number): Group;
    /** Get message bundles */
    static getBundles(): Bundle[];
    /** Handle message using Level.fine. Any '%' will be substituded by args */
    static fine(grpno: number, errno: number, ...args: any): Promise<void>;
    /** Handle message using Level.info. Any '%' will be substituded by args */
    static info(grpno: number, errno: number, ...args: any): Promise<void>;
    /** Handle message using Level.warn. Any '%' will be substituded by args */
    static warn(grpno: number, errno: number, ...args: any): Promise<void>;
    /** Handle message using Level.severe. Any '%' will be substituded by args */
    static severe(grpno: number, errno: number, ...args: any): Promise<void>;
    /** Handle unknown message (typically from backend systems) */
    static handle(grpno: number, message: any, level: Level): Promise<void>;
    private static show;
    private static load;
    private static replace;
    private static display;
}
/** Severity */
export declare enum Level {
    fine = 0,
    info = 1,
    warn = 2,
    severe = 3
}
