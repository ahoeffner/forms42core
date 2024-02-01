import { Form } from '../../public/Form.js';
/**
 *
 * Annotations provides a short and easy way to inject code.
 *
 * The following:
 *
 * @block("employee")
 * private emp:Block;
 *
 * Will create and inject a block into the variable emp
 */
export declare const block: (block: string) => (form: Form, attr: string) => void;
