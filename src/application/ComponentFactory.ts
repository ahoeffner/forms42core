import { Form } from "../forms/Form.js";
import { Class } from "../types/Class.js";
import { Include } from "../tags/Include.js";
import { ComponentFactory as Factory } from "./interfaces/ComponentFactory.js";

export class ComponentFactory implements Factory
{
    createBean(bean:Class<any>) : any {return(new bean())}
    createForm(form:Class<Form>) : Form {return(new form())};
    createInclude(incl:Class<any>) : Include {return(new incl())}
}