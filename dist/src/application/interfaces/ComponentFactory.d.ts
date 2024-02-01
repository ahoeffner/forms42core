import { Form } from '../../public/Form.js';
import { Class } from '../../public/Class.js';
import { HTMLFragment } from '../HTMLFragment.js';
/**
 * The ComponentFactory defines the necessary
 * methods to create beans, html-fragments and forms.
 *
 * When using some frameworks, like Angular, this class
 * must be replaced to conform with the framework.
 */
export interface ComponentFactory {
    createBean(bean: Class<any>): any;
    createFragment(frag: Class<any>): HTMLFragment;
    createForm(form: Class<Form>, parameters?: Map<any, any>): Promise<Form>;
}
