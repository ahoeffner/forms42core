import { Class } from "../Class";

export interface Component
{
    path:string;
    class:Class<any>;
}


export const ModuleDefinition = (components:(Class<any> | Component)[]) =>
{
    function define(comp:Class<any>)
    {
        components.forEach(element =>
        {
            let ctype:boolean = (element['path'] != null);
            if (ctype) console.log("path: "+(element as Component).path)
            else       console.log((element as Class<any>).name);
        });
    }

    return(define);
}