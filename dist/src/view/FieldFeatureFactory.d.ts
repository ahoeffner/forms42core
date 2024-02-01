import { Status } from "./Row.js";
import { FieldInstance } from "./fields/FieldInstance.js";
import { FieldProperties } from "./fields/FieldProperties.js";
import { BasicProperties } from "./fields/BasicProperties.js";
export declare class FieldFeatureFactory {
    private static lists;
    static initialize(props: BasicProperties, inst: FieldInstance, deflt: boolean, type: Status): void;
    static clone(props: FieldProperties): FieldProperties;
    static replace(props: BasicProperties, inst: FieldInstance, status: Status): void;
    static copyBasic(exist: BasicProperties, props: BasicProperties): void;
    static reset(tag: HTMLElement): void;
    static consume(tag: HTMLElement): FieldProperties;
    static apply(inst: FieldInstance, props: FieldProperties): void;
    static setMode(inst: FieldInstance, props: FieldProperties): void;
    static applyType(inst: FieldInstance): void;
    static createDataList(inst: FieldInstance, props: FieldProperties): void;
    static setReadOnlyState(tag: HTMLElement, props: FieldProperties, flag: boolean): void;
    static setEnabledState(tag: HTMLElement, props: FieldProperties, flag: boolean): void;
    static setReadOnly(tag: HTMLElement, flag: boolean): void;
    static setEnabled(tag: HTMLElement, flag: boolean): void;
    static getSelectOptions(tag: HTMLSelectElement): Map<string, string>;
    static setSelectOptions(tag: HTMLSelectElement, props: FieldProperties): void;
}
