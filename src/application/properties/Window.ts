/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

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
    public handleClass:string = "window-handle";
}