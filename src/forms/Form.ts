export class Form
{
    private page$:string = null;

    constructor(page?:string)
    {
        this.page$ = page;
    }


    public page() : string
    {
        return(this.page$);
    }
}