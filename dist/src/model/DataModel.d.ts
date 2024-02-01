import { Block as ModelBlock } from "../model/Block.js";
import { DataSource } from "./interfaces/DataSource.js";
import { DataSourceWrapper } from "./DataSourceWrapper.js";
export declare class DataModel {
    private defined$;
    private sources$;
    clear(block: ModelBlock, flush: boolean): void;
    getWrapper(block: ModelBlock): DataSourceWrapper;
    setWrapper(block: ModelBlock): DataSourceWrapper;
    getDataSource(block: string): DataSource;
    setDataSource(block: string, source: DataSource): void;
}
