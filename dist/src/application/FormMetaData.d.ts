import { Form } from "../public/Form.js";
import { Block } from "../public/Block.js";
import { Class } from '../public/Class.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
export declare class FormMetaData {
    private static metadata;
    private static lsnrevents$;
    private static blockevents$;
    static cleanup(form: Form): void;
    static setBlockEvent(block: Block, method: string, filter: EventFilter | EventFilter[]): void;
    static getBlockEvents(block: Block): BlockEvent[];
    static setListenerEvent(lsnr: any, method: string, filter: EventFilter | EventFilter[]): void;
    static getListenerEvents(lsnr: any): BlockEvent[];
    static get(form: Class<Form> | Form, create?: boolean): FormMetaData;
    blockattrs: Map<string, string>;
    formevents: Map<string, EventFilter | EventFilter[]>;
    private blocksources$;
    getDataSources(): Map<string, DataSource>;
    addDataSource(block: string, source: Class<DataSource> | DataSource): void;
    getDataSource(block: string): DataSource;
}
export declare class BlockEvent {
    method: string;
    filter: EventFilter | EventFilter[];
    constructor(method: string, filter: EventFilter | EventFilter[]);
}
