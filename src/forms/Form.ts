export class Form
{
    private page$:Element = null;
    private navigable$:boolean = true;

    constructor(page?:string)
    {
        this.setPage(page);
    }

    public get navigable() : boolean
    {
        return(this.navigable$);
    }

    public set navigable(navigable:boolean)
    {
        this.navigable$ = navigable;
    }

    public setPage(page:string|Element)
    {
        if (!(page instanceof Element))
        {
            let template:HTMLTemplateElement = document.createElement('template');
            template.innerHTML = page; page = template.content.getRootNode() as Element;
        }
        this.page$ = page;
    }

    public getPage() : Element
    {
        return(this.page$);
    }
}