/**
 * To implement a custom tag write a class implementing the Tag interface.
 * Then inject the class together with a tag-name into the FormProperties.TagLibrary.
 */
export interface Tag {
    recursive?: boolean;
    parse(component: any, tag: HTMLElement, attr: string): HTMLElement | HTMLElement[] | string | null;
}
