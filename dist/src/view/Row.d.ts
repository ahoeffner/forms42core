import { Block } from "./Block.js";
import { Field } from "./fields/Field.js";
import { FieldInstance } from "./fields/FieldInstance.js";
import { RowIndicator } from "../application/tags/RowIndicator.js";
import { FieldState } from "./fields/interfaces/FieldImplementation.js";
export declare enum Status {
    na = 0,
    qbe = 1,
    new = 2,
    update = 3,
    insert = 4,
    delete = 5
}
export declare class Row {
    private block$;
    private rownum$;
    private validated$;
    private indicator$;
    private status$;
    private indicators;
    private instances;
    private state$;
    private fields;
    constructor(block: Block, rownum: number);
    get block(): Block;
    get exist(): boolean;
    get status(): Status;
    set status(status: Status);
    get rownum(): number;
    set rownum(rownum: number);
    setSingleRow(): void;
    setIndicator(ind: RowIndicator): void;
    setIndicatorState(state: string, failed: boolean): void;
    activateIndicators(flag: boolean): void;
    finalize(): void;
    getFieldState(): FieldState;
    setFieldState(state: FieldState): void;
    get validated(): boolean;
    set validated(flag: boolean);
    invalidate(): void;
    validate(): Promise<boolean>;
    addField(field: Field): void;
    addInstance(instance: FieldInstance): void;
    setInstances(instances: FieldInstance[]): void;
    focusable(): boolean;
    getFieldIndex(inst: FieldInstance): number;
    getFieldByIndex(idx: number): FieldInstance;
    prevField(inst: FieldInstance): FieldInstance;
    nextField(inst: FieldInstance): FieldInstance;
    getField(name: string): Field;
    getFields(): Field[];
    clear(): void;
    setState(state: Status): void;
    distribute(field: string, value: any, dirty: boolean): void;
    swapInstances(inst1: FieldInstance, inst2: FieldInstance): void;
    getFieldInstances(): FieldInstance[];
    getFirstInstance(status: Status): FieldInstance;
    getFirstEditableInstance(status: Status): FieldInstance;
}
