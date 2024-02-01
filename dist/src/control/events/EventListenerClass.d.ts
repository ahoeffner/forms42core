import { EventFilter } from "./EventFilter.js";
import { TriggerFunction } from "../../public/TriggerFunction.js";
/**
 * EventListener basic class
 * Any class can extend this and thereby become an event-listener
 */
export declare class EventListenerClass {
    protected constructor();
    removeEventListener(handle: object): void;
    addEventListener(method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
}
