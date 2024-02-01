import { Block } from "./Block.js";
import { Record } from "./Record.js";
import { EventType } from "../control/events/EventType.js";
export declare class EventTransaction {
    private transactions;
    start(event: EventType, block: Block, record: Record): EventType;
    running(): number;
    clear(): void;
    finish(block: Block): void;
    getEvent(block: Block): EventType;
    getRecord(block: Block): Record;
    getTrxSlot(block: Block): EventType;
}
