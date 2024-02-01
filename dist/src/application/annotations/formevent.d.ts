import { EventFilter } from '../../control/events/EventFilter.js';
/**
 *
 * Annotations provides a short and easy way to inject code.
 *
 * The following:
 *
 * @formevent({type: EventType.PostChange, block: "ctrl", field: "name"})
 * public async postchange() : Promise<boolean>
 *
 * Will create and inject an event-listener that will invoke the postchange()
 * when a PostChange event occurs on the name field in the ctrl block.
 *
 */
export declare const formevent: (filter?: EventFilter | EventFilter[]) => (lsnr: any, method: string) => any;
