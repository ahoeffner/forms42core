import { Form } from "../forms/Form";
import { Class } from "../types/Class";

export class ComponentFactory
{
    createBean(bean:Class<any>) : any {return(new bean())}
    createForm(form:Class<Form>) : Form {return(new form())};
}