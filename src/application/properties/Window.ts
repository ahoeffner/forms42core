export class Window
{
    public page:string =
    `
    <style>
        .window-handle
        {
            resize: both;
            overflow:hidden;
            position: absolute;
        }

        .window-page-content
        {
            top: 0;
            left: 0;
            position: relative;
            width: fit-content;
            height: fit-content;
        }

        .window-modal-block
        {
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            position: absolute;
        }
    </style>

    <div name="window" class="window-handle">
        <div name="modal" class="window-modal-block"></div>
        <div name="page" class="window-page-content"></div>
    </div>

    `

    public modalClasses:string = "modal";
    public windowClasses:string = "window";
    public contentClasses:string = "content";
}