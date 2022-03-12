import { Class } from "./Class";
import { Form } from "./forms/Form";

export const bean = (path?:string) =>
{
    function define(comp:Class<any>)
    {
        if (path == null)
            path = comp.name.toLowerCase();

        console.log("register bean: "+comp.name+" at "+path+" "+(comp.prototype instanceof Form));

        let form:Form = new comp();
        console.log("path: "+path+" "+form.page());
    }

    return(define);
}