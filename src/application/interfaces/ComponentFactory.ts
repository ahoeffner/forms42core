import { Form } from "../../forms/Form";
import { Class } from "../../types/Class";

export interface ComponentFactory
{
    createBean(bean:Class<any>) : any;
    createForm(form:Class<Form>) : Form;
}