import { Tag } from './tags/Tag.js';
import { Class } from '../public/Class.js';
export declare class Framework {
    private component;
    private static event$;
    private static taglib;
    private static attrlib;
    eventhandler: EventHandler;
    events: Map<Element, string[][]>;
    static getEvent(): any;
    static setEvent(event: any): void;
    private static loadTaglib;
    private static loadAttrlib;
    static addTag(tag: string, clazz: Class<Tag>): void;
    static addAttr(tag: string, clazz: Class<Tag>): void;
    static parse(component: any, doc: Element): Framework;
    static prepare(element: string | HTMLElement): HTMLElement;
    static copyAttributes(fr: Element, to: Element): void;
    private constructor();
    private parseDoc;
    private addEvents;
    private getImplementation;
    private getReplacement;
    private apply;
    private applyEvents;
}
export declare class DynamicCall {
    path: string[];
    method: string;
    args: string[];
    component: any;
    constructor(component: any, signature: string);
    private parse;
    invoke(event: any): Promise<void>;
    toString(): string;
}
declare class EventHandler implements EventListenerObject {
    private component;
    private events;
    constructor(component: any);
    addEvent(element: Element, event: string, handler: DynamicCall): string;
    getEvent(element: Element, event: string): DynamicCall;
    handleEvent(event: Event): void;
}
export {};
