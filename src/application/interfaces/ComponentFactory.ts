import { Form } from "../../forms/Form";
import { Class } from "../../types/Class";
import { Include } from "../../tags/Include";

export interface ComponentFactory
{
    createBean(bean:Class<any>) : any;
    createForm(form:Class<Form>) : Form;
    createInclude(incl:Class<any>) : Include;
}