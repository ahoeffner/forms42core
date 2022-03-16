export class Parser
{
    private bytag:boolean = true;
    private bycls:boolean = true;
    private events:boolean = true;

    public parse(doc:Element) : void
    {
        let list:NodeListOf<Element> = doc.querySelectorAll("*");

        for (let i = 0; i < list.length; i++)
        {
            let element:Element = list.item(i);
            let names:string[] = element.getAttributeNames();

            console.log(element.nodeName);

            for (let a = 0; a < names.length; a++)
            {
                let val:string = element.getAttribute(names[a]);
                console.log(names[a]+" "+val);
                if (names[a].startsWith("on") && val != null && val.trim().startsWith("this."))
                {
                    element.removeAttribute(names[a]);
                }
            }
        }

    }
}