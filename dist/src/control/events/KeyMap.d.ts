import { Class } from "../../public/Class.js";
import { BrowserEvent } from "./BrowserEvent.js";
/**
 * Map over key events
 * Can be overridden by application
 */
export declare class KeyMap {
    static copy: KeyMap;
    static undo: KeyMap;
    static paste: KeyMap;
    static dump: KeyMap;
    static now: KeyMap;
    static commit: KeyMap;
    static rollback: KeyMap;
    static refresh: KeyMap;
    static clearblock: KeyMap;
    static clearform: KeyMap;
    static enterquery: KeyMap;
    static executequery: KeyMap;
    static lastquery: KeyMap;
    static queryeditor: KeyMap;
    static space: KeyMap;
    static enter: KeyMap;
    static escape: KeyMap;
    static pageup: KeyMap;
    static pagedown: KeyMap;
    static nextfield: KeyMap;
    static prevfield: KeyMap;
    static prevrecord: KeyMap;
    static nextrecord: KeyMap;
    static prevblock: KeyMap;
    static nextblock: KeyMap;
    static delete: KeyMap;
    static insert: KeyMap;
    static insertAbove: KeyMap;
    static lov: KeyMap;
    static calendar: KeyMap;
    static from(key: string): KeyMap;
    static list(map?: Class<any>): string[][];
    private key$;
    private name$;
    private desc$;
    private alt$;
    private ctrl$;
    private meta$;
    private shift$;
    private signature$;
    constructor(def: KeyDefinition, name?: string, desc?: string);
    get name(): string;
    set name(name: string);
    get desc(): string;
    set desc(desc: string);
    get key(): string;
    get alt(): boolean;
    get ctrl(): boolean;
    get meta(): boolean;
    get shift(): boolean;
    get signature(): string;
    get definition(): KeyDefinition;
    setSignature(def: KeyDefinition): void;
    toString(): string;
}
/**
 * Data describing a key event
 */
export interface KeyDefinition {
    key: string;
    alt?: boolean;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
}
export declare class KeyMapping {
    private static map;
    static init(): void;
    static update(map: Class<KeyMap>): void;
    static isRowNav(key: KeyMap): boolean;
    static isBlockNav(key: KeyMap): boolean;
    static isFormNav(key: KeyMap): boolean;
    static add(keymap: KeyMap): void;
    static remove(keymap: KeyMap): void;
    static get(signature: string, validated?: boolean): KeyMap;
    static parseBrowserEvent(event: BrowserEvent): KeyMap;
    private static complete;
    private static create;
}
