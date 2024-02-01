import { KeyMap } from "./KeyMap.js";
import { MouseMap } from "./MouseMap.js";
import { EventType } from "./EventType.js";
import { Form } from "../../public/Form.js";
import { Form as InternalForm } from "../../internal/Form.js";
/**
 * Data class that holds information
 * on what and where an event occured
 */
export interface FormEvent {
    key: KeyMap;
    jsevent: any;
    field: string;
    block: string;
    type: EventType;
    mouse: MouseMap;
    form: Form | InternalForm;
}
