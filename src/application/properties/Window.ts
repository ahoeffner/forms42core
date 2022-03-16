export class Window
{
    public page:string =
    `
    <div name="window">
        <div name="modal"></div>
        <div name="content"></div>
    </div>

    `

    public modalStyle:string =
    `
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        position: absolute;
    `

    public windowStyle:string =
    `
        resize: both;
        overflow:hidden;
        position: absolute;
    `

    public contentStyle:string =
    `
        top: 0;
        left: 0;
        position: relative;
        width: fit-content;
        height: fit-content;
    `


    public modalClasses:string = "modal";
    public windowClasses:string = "window";
    public contentClasses:string = "content";
}