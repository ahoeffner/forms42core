import { Form } from "../../forms/Form.js";
import { Class } from "../../types/Class.js";
import { Include } from "../../tags/Include.js";

export interface ComponentFactory
{
    createBean(bean:Class<any>) : any;
    createForm(form:Class<Form>) : Form;
    createInclude(incl:Class<any>) : Include;
}