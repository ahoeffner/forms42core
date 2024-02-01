import { Form } from '../public/Form.js';
import { Class } from '../public/Class.js';
import { HTMLFragment } from './HTMLFragment.js';
import { ComponentFactory as Factory } from './interfaces/ComponentFactory.js';
export declare class ComponentFactory implements Factory {
    createBean(bean: Class<any>): any;
    createFragment(frag: Class<any>): HTMLFragment;
    createForm(form: Class<Form>, parameters?: Map<any, any>): Promise<Form>;
}
