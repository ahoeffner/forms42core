import { TriggerFunction } from './TriggerFunction.js';
import { EventFilter } from '../control/events/EventFilter.js';
/**
 * Implements addEventListener. Meant for extending custom classes that needs event listeners
 */
export declare class EventListener {
    /** Remove an eventlistener. This should also be done before setView is called
  *
  * @param handle - The handle of the event listener to be removed.
  * @public
  */
    removeEventListener(handle: object): void;
    /** Add an eventlistener
  *
  * @param method - The callback function to be executed when the event occurs.
  * @param filter - An optional event filter or an array of event filters to control which events trigger the callback.
  * @returns A handle representing the added event listener.
  * @public
  */
    addEventListener(method: TriggerFunction, filter?: EventFilter | EventFilter[]): object;
}
