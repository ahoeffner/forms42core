export enum Type
{
    htmlparser,
    eventparser,
    classloader,
	formbinding
}

export class Logger
{
    public static htmlparser:boolean = false;
    public static eventparser:boolean = false;
    public static classloader:boolean = false;
    public static formbinding:boolean = false;

    public static log(type:Type, msg:string) : void
    {
        let flag:string = Type[type];
        if (Logger[flag]) console.log(msg);
    }
}