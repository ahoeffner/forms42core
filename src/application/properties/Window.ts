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

    <div class="window-handle">
        <div class="window-modal-block"></div>
        <div class="window-page-content"></div>
    </div>

    `
    public classes:string = "window";
}