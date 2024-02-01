import { Tag } from "./Tag.js";
export declare class FilterIndicator implements Tag {
    binding: string;
    element: HTMLElement;
    parse(component: any, tag: HTMLElement, attr: string): HTMLElement;
}
