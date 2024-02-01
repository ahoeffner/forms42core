import { Form } from './Form.js';
import { Class } from '../public/Class.js';
/**
 * Defines which forms to be used internally.
 * Can be replaced by advanced users.
 */
export declare class Classes {
    private static zindex$;
    static AlertClass: Class<Form>;
    static DatePickerClass: Class<Form>;
    static ListOfValuesClass: Class<Form>;
    static AdvancedQueryClass: Class<Form>;
    static get zindex(): number;
    static isInternal(clazz: Class<Form>): boolean;
}
