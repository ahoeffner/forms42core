import { Form } from "../../public/Form.js";
import { EventFilter } from "./EventFilter.js";
export declare class EventListener {
    id: object;
    form: Form;
    clazz: any;
    filter: EventFilter;
    method: string;
    constructor(id: object, form: Form, clazz: any, method: Function | string, filter: EventFilter);
    toString(): string;
}
