import { BrowserEvent } from "./BrowserEvent.js";
/**
 * Map over mouse events
 */
export declare enum MouseMap {
    drop = 0,
    click = 1,
    dblclick = 2,
    contextmenu = 3,
    drag = 4,
    dragend = 5,
    dragover = 6,
    dragstart = 7,
    dragenter = 8,
    dragleave = 9
}
export declare class MouseMapParser {
    static parseBrowserEvent(event: BrowserEvent): MouseMap;
}
