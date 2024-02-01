import { DataType } from "./DataType.js";
import { DataMapper } from "./DataMapper.js";
import { Class } from "../../public/Class.js";
import { FieldInstance } from "./FieldInstance.js";
import { BasicProperties } from "./BasicProperties.js";
import { ListOfValues } from "../../public/ListOfValues.js";
import { Formatter, SimpleFormatter } from "./interfaces/Formatter.js";
export declare class FieldProperties extends BasicProperties {
    protected row$: number;
    protected id$: string;
    protected name$: string;
    protected block$: string;
    protected inst$: FieldInstance;
    get id(): string;
    set id(id: string);
    get type(): string;
    get name(): string;
    set name(name: string);
    get block(): string;
    set block(block: string);
    get row(): number;
    set row(row: number);
    get inst(): FieldInstance;
    set inst(inst: FieldInstance);
    setTag(tag: string): FieldProperties;
    setType(type: DataType): FieldProperties;
    setEnabled(flag: boolean): FieldProperties;
    setDisabled(flag: boolean): FieldProperties;
    setReadOnly(flag: boolean): FieldProperties;
    setRequired(flag: boolean): FieldProperties;
    setHidden(flag: boolean): FieldProperties;
    setStyles(styles: string): FieldProperties;
    removeStyle(style: string): FieldProperties;
    setClass(clazz: string): FieldProperties;
    setClasses(classes: string | string[]): FieldProperties;
    removeClass(clazz: any): FieldProperties;
    setAttribute(attr: string, value?: any): FieldProperties;
    setAttributes(attrs: Map<string, string>): FieldProperties;
    removeAttribute(attr: string): FieldProperties;
    setValue(value: string): FieldProperties;
    setValidValues(values: string[] | Set<any> | Map<any, any>): FieldProperties;
    setMapper(mapper: Class<DataMapper> | DataMapper | string): FieldProperties;
    setFormatter(formatter: Class<Formatter> | Formatter | string): FieldProperties;
    /** Set simple formatter */
    setSimpleFormatter(formatter: Class<SimpleFormatter> | SimpleFormatter | string): FieldProperties;
    /** Set listofvalues */
    setListOfValues(listofvalues: Class<ListOfValues> | ListOfValues | string): FieldProperties;
}
