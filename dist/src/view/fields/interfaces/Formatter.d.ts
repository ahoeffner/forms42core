import { DataType } from "../DataType.js";
/** Only basic test */
export declare function isFormatter(object: any): object is Formatter;
/** Only basic test */
export declare function isSimpleFormatter(object: any): object is SimpleFormatter;
/**
 * Simple formatters can be injected into an <input> field.
 * <input formatter="path_to_injected_class">
 */
export interface SimpleFormatter {
    getValue(): string;
    setValue(value: any): void;
}
/**
 * Formatters can be injected into an <input> field.
 * <input format="some-mask" formatter="path_to_injected_class">
 */
export interface Formatter {
    format: string;
    datatype: DataType;
    placeholder: string;
    size(): number;
    isNull(): boolean;
    getValue(): string;
    setValue(value: any): boolean;
    last(): number;
    first(): number;
    prev(from: number): number;
    next(from: number): number;
    delete(fr: number, to: number): string;
    modifiable(pos: number): boolean;
    insCharacter(pos: number, c: string): boolean;
    setCharacter(pos: number, c: string): boolean;
    finish(): string;
}
