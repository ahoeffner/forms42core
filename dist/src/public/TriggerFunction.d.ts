import { FormEvent } from "../control/events/FormEvent.js";
import { MenuEvent } from "../control/events/MenuEvent.js";
import { CustomEvent } from "../control/events/CustomEvent.js";
export interface TriggerFunction {
    (event?: FormEvent | MenuEvent | CustomEvent): boolean | Promise<boolean>;
}
