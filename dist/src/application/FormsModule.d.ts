import { Form } from '../public/Form.js';
import { Class } from '../public/Class.js';
import { Level } from '../messages/Messages.js';
import { Form as InternalForm } from '../internal/Form.js';
import { TriggerFunction } from '../public/TriggerFunction.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { DatabaseConnection } from '../public/DatabaseConnection.js';
/**
 * The starting point or boot-strap of a FutureForms application
 */
export declare class FormsModule {
    private static root$;
    private static flush$;
    private static showurl$;
    private static instance$;
    /** Static method to return the singleton */
    static get<FormsModule>(): FormsModule;
    /** Whether or not to display the active form in the url */
    static get showurl(): boolean;
    /** Whether or not to display the active form in the url */
    static set showurl(flag: boolean);
    /** Flush when leaving row or block */
    static get defaultFlushStrategy(): FlushStrategy;
    /** Flush when leaving row or block */
    static set defaultFlushStrategy(strategy: FlushStrategy);
    /** The root element to which 'popup' forms will be added (default document.body) */
    static getRootElement(): HTMLElement;
    /** The root element to which 'popup' forms will be added (default document.body) */
    static setRootElement(root: HTMLElement): void;
    /** Make a Form navigable directly via the URL */
    static setURLNavigable(name: string, nav: boolean): void;
    /** Get the latest javascript event */
    static getJSEvent(): any;
    /** Map a component to string (or the name of the class) */
    static mapComponent(clazz: Class<any>, path?: string): void;
    /** Get the string a given class or class-name is mapped to */
    static getFormPath(clazz: Class<any> | string): string;
    /** Get the component a given path is mapped to */
    static getComponent(path: string): Class<any>;
    /** Update the internal KeyMap based on a new KeyMap */
    static updateKeyMap(map: Class<KeyMap>): void;
    /** Open the form defined in the URL */
    static OpenURLForm(): boolean;
    /** Retrive the current active Form */
    static getCurrentForm(): Form;
    /** Retrive the current active HTMLElement */
    static getCurrentField(): HTMLElement;
    /** Emulate a user key-stroke */
    static sendkey(key: KeyMap | string): Promise<boolean>;
    /** Whether a given DatabaseConnection has outstanding transactions */
    static hasTransactions(connection?: DatabaseConnection): boolean;
    /** Issue commit on all DatabaseConnection's */
    static commit(): Promise<boolean>;
    /** Issue rollback on all DatabaseConnection's */
    static rollback(): Promise<boolean>;
    /** Handle fine message */
    static fine(grpno: number, errno: number, ...args: any): void;
    /** Handle info message */
    static info(grpno: number, errno: number, ...args: any): void;
    /** Handle warning message */
    static warn(grpno: number, errno: number, ...args: any): void;
    /** Handle severe message */
    static severe(grpno: number, errno: number, ...args: any): void;
    /** Popup a message */
    static alert(msg: string, title: string, level?: Level): void;
    /** Get all active forms */
    static getRunningForms(): Form[];
    /** Create a form based on the page */
    static createform(form: Class<Form | InternalForm> | string, page: HTMLElement, parameters?: Map<any, any>): Promise<Form>;
    /** Create and attach a form to the container (or root-element) */
    static showform(form: Class<Form | InternalForm> | string, parameters?: Map<any, any>, container?: HTMLElement): Promise<Form>;
    /** Show the blocking 'loading' html */
    static showLoading(message: string): number;
    /** Remove the blocking 'loading' html */
    static hideLoading(thread: number): void;
    /** Raise a Custom Event */
    static raiseCustomEvent(source: any): Promise<boolean>;
    /** Remove an event-listener */
    static removeEventListener(id: object): void;
    /** Utility. Use with care since javascript is actually single-threaded */
    static sleep(ms: number): Promise<boolean>;
    constructor();
    /** Parse a given Element to find and process FutureForms elements */
    parse(doc?: Element): void;
    /** Add an event-listener */
    addEventListener(method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
    /** Add an event-listener on a given Form */
    addFormEventListener(form: Form | InternalForm, method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
}
export declare enum FlushStrategy {
    Row = 0,
    Block = 1
}
