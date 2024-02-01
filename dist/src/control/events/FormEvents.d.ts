import { KeyMap } from "./KeyMap.js";
import { MouseMap } from "./MouseMap.js";
import { MenuEvent } from "./MenuEvent.js";
import { Form } from "../../public/Form.js";
import { CustomEvent } from "./CustomEvent.js";
import { EventFilter } from "./EventFilter.js";
import { EventListener } from "./EventListener.js";
import { EventType } from "./EventType.js";
import { FormEvent as Interface } from "./FormEvent.js";
import { MenuComponent } from "../menus/MenuComponent.js";
import { FieldInstance as ViewFieldInstance } from "../../view/fields/FieldInstance.js";
export declare class KeyEventSource {
    key: KeyMap;
    field: string;
    block: string;
    record: number;
    form: Form;
    constructor(key: KeyMap, field: string, block: string, record: number, form: Form);
}
export declare class FormEvent implements Interface, MenuEvent, CustomEvent {
    private type$;
    private form$;
    private inst?;
    private block$?;
    private key$?;
    private mevent$?;
    static AppEvent(type: EventType, source?: any): FormEvent;
    static FormEvent(type: EventType, form: Form): FormEvent;
    static BlockEvent(type: EventType, form: Form, block: string, inst?: ViewFieldInstance | string): FormEvent;
    static FieldEvent(type: EventType, inst: ViewFieldInstance): FormEvent;
    static KeyEvent(form: Form, inst: ViewFieldInstance, key: KeyMap): FormEvent;
    static MouseEvent(form: Form, event: MouseMap, inst?: ViewFieldInstance, block?: string): FormEvent;
    private source$;
    private constructor();
    get type(): EventType;
    get form(): Form;
    get block(): string;
    get jsevent(): any;
    get key(): KeyMap;
    get field(): string;
    get menu(): MenuComponent;
    get source(): any;
    get mouse(): MouseMap;
    toString(): string;
}
export declare class FormEvents {
    private static listeners;
    private static applisteners;
    private static frmlisteners;
    private static blklisteners;
    private static fldlisteners;
    static addListener(form: Form, clazz: any, method: Function | string, filter?: EventFilter | EventFilter[]): object;
    static getListener(id: object): EventListener;
    static removeListener(id: object): void;
    static raise(event: FormEvent): Promise<boolean>;
    private static merge;
    private static execute;
    private static match;
    private static add;
}
