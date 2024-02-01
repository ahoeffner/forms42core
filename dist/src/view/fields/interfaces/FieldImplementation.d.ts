import { DataType } from "../DataType.js";
import { FieldProperties } from "../FieldProperties.js";
import { FieldEventHandler } from "./FieldEventHandler.js";
export declare enum FieldState {
    OPEN = 0,
    READONLY = 1,
    DISABLED = 2
}
export interface FieldImplementation {
    datatype: DataType;
    apply(properties: FieldProperties, init: boolean): void;
    create(eventhandler: FieldEventHandler, tag: string): HTMLElement;
    clear(): void;
    getValue(): any;
    setValue(value: any): boolean;
    setValidated(): void;
    getIntermediateValue(): string;
    setIntermediateValue(value: string): void;
    getFieldState(): FieldState;
    setFieldState(state: FieldState): void;
    getElement(): HTMLElement;
}
