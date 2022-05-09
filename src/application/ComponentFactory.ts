import { Form } from '../public/Form.js';
import { Class } from '../types/Class.js';
import { HTMLFragment } from './HTMLFragment.js';
import { ComponentFactory as Factory } from './interfaces/ComponentFactory.js';

export class ComponentFactory implements Factory
{
    createBean(bean:Class<any>) : any {return(new bean())}
    createForm(form:Class<Form>) : Form {return(new form())}
    createFragment(frag:Class<any>) : HTMLFragment {return(new frag())}
}