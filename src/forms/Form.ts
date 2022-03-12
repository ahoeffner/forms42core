export class Form
{
    private page$:string = null;
    private navigable$:boolean = true;

    constructor(page?:string)
    {
        this.page$ = page;
    }


    public get navigable() : boolean
    {
        return(this.navigable$);
    }


    public set navigable(navigable:boolean)
    {
        this.navigable$ = navigable;
    }


    public page() : string
    {
        return(this.page$);
    }
}