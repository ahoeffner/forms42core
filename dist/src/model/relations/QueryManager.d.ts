import { Block } from "../Block";
export declare class QueryManager {
    qid$: number;
    qmaster$: Block;
    running$: Map<Block, object>;
    getQueryID(): object;
    startNewChain(): object;
    stopAllQueries(): void;
    setRunning(block: Block, qid: object): void;
    getRunning(block: Block): object;
    hasRunning(): boolean;
    get QueryMaster(): Block;
    set QueryMaster(qmaster: Block);
    static sleep(ms: number): Promise<void>;
}
