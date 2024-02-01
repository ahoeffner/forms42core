import { BrowserEvent } from "../../../control/events/BrowserEvent.js";
export interface FieldEventHandler {
    handleEvent(event: BrowserEvent): Promise<void>;
}
