import { KeyMap } from "./KeyMap.js";
import { MouseMap } from "./MouseMap.js";
import { EventType } from "./EventType.js";
/**
 * Used for filtering events by event-listeners
 */
export interface EventFilter {
    type?: EventType;
    key?: KeyMap;
    field?: string;
    block?: string;
    mouse?: MouseMap;
}
