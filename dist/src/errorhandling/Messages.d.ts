import { Group } from "./interfaces/Group.js";
import { Bundle } from "./interfaces/Bundle.js";
import { Message } from "./interfaces/Message.js";
export declare class Messages {
    private static files$;
    private static language$;
    private static groups$;
    private static messages$;
    /** all messages language */
    static set language(language: string);
    /** all messages language */
    static get language(): string;
    /** Add message bundle */
    static addBundle(bundle: Bundle): void;
    static get bundles(): Bundle[];
    static info(grpno: number, errno: number): Promise<void>;
    static getGroup(grpno: number): Group;
    static getMessage(grpno: number, errno: number): Message;
    private static show;
    private static load;
}
export declare enum Level {
    fine = 0,
    info = 1,
    warn = 2,
    fatal = 3
}
