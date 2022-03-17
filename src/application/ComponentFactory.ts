import { Form } from "../forms/Form";
import { Class } from "../types/Class";
import { Include } from "../tags/Include";
import { ComponentFactory as Factory } from "./interfaces/ComponentFactory";

export class ComponentFactory implements Factory
{
    createBean(bean:Class<any>) : any {return(new bean())}
    createForm(form:Class<Form>) : Form {return(new form())};
    createInclude(incl:Class<any>) : Include {return(new incl())}
}