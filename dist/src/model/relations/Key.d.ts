import { Block } from "../Block.js";
/**
 * A Key is simply a definition stating that
 * on a given block, one or more fields exists
 * and can be related to other keys on other blocks.
 *
 * Much like primary/foreign keys in databases.
 */
export declare class Key {
    private name$;
    private block$;
    private fields$;
    constructor(block: string | Block, fields: string | string[]);
    get name(): string;
    get block(): string;
    get fields(): string[];
}
