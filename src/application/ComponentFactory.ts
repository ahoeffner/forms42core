import { Form } from '../public/Form.js';
import { Class } from '../types/Class.js';
import { FormBacking } from './FormBacking.js';
import { HTMLFragment } from './HTMLFragment.js';
import { ComponentFactory as Factory } from './interfaces/ComponentFactory.js';

export class ComponentFactory implements Factory
{
	createBean(bean:Class<any>) : any {return(new bean())}

	async createForm(form:Class<Form>) : Promise<Form>
	{
		let instance:Form = new form();
		let page:string|HTMLElement = FormBacking.getBacking(instance).page;

		if (page != null)
			instance.setView(page);
			
		return(instance)
	}

	createFragment(frag:Class<any>) : HTMLFragment {return(new frag())}
}