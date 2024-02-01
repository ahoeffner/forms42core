import { Form } from "../Form.js";
import { Block } from "../Block.js";
import { Relation } from "./Relation.js";
export declare class BlockCoordinator {
    private form;
    constructor(form: Form);
    private blocks$;
    getQueryMaster(block?: Block): Block;
    allowQueryMode(block: Block): boolean;
    getMasterBlock(link: Relation): Block;
    getDetailBlock(link: Relation): Block;
    getDetailBlocks(block: Block, all: boolean): Block[];
    getMasterBlocks(block?: Block): Block[];
    getDetailBlocksForField(block: Block, field: string): Block[];
    getMasterLinks(block: Block): Relation[];
    getDetailLinks(block: Block): Relation[];
    allowMasterLess(master: Block, detail: Block): boolean;
    findRelation(master: Block | string, detail: Block | string): Relation;
    link(link: Relation): void;
    getBlock(name: string): Block;
    getLinkedColumns(block: Block): string[];
}
