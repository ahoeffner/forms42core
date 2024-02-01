import { Tag } from "./Tag.js";
export declare class FromAttribute implements Tag {
    recursive: boolean;
    parse(component: any, tag: HTMLElement, attr: string): string | HTMLElement | HTMLElement[];
}
