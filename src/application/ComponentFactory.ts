import { Form } from '../public/Form.js';
import { Class } from '../types/Class.js';
import { FormBacking } from './FormBacking.js';
import { HTMLFragment } from './HTMLFragment.js';
import { ComponentFactory as Factory } from './interfaces/ComponentFactory.js';

export class ComponentFactory implements Factory
{
	createBean(bean:Class<any>) : any {return(new bean())}
	createFragment(frag:Class<any>) : HTMLFragment {return(new frag())}

	async createForm(form:Class<Form>, parameters?:Map<any,any>) : Promise<Form>
	{
		let instance:Form = new form();
		if (parameters != null) instance.parameters = parameters;

		let page:string|HTMLElement = FormBacking.getBacking(instance).page;

		if (page != null)
			instance.setView(page);

		return(instance)
	}
}