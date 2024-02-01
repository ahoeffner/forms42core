import { BrowserEvent } from "./BrowserEvent.js";
import { Field } from "../../view/fields/Field.js";
import { DynamicCall } from "../../application/Framework.js";
import { FieldInstance } from "../../view/fields/FieldInstance.js";
interface event {
    fev?: fieldevent;
    ext?: externalevent;
}
interface fieldevent {
    field: Field;
    inst: FieldInstance;
    brwevent: BrowserEvent;
}
interface externalevent {
    event: any;
    func: DynamicCall;
}
export declare class EventStack {
    static stack$: event[];
    static running: boolean;
    static send(inst: FieldInstance, brwevent: BrowserEvent): Promise<void>;
    static queue(func: DynamicCall, event: any): Promise<void>;
    static stack(field: Field, inst: FieldInstance, brwevent: BrowserEvent): Promise<void>;
    static handle(): Promise<void>;
    static clear(): void;
}
export {};
