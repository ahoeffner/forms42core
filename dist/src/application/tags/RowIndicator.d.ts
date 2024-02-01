import { Tag } from "./Tag.js";
export declare class RowIndicator implements Tag {
    row: number;
    binding: string;
    element: HTMLElement;
    parse(component: any, tag: HTMLElement, attr: string): HTMLElement;
}
