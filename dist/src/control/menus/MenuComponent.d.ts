import { Menu } from './interfaces/Menu.js';
import { MenuEntry } from './interfaces/MenuEntry.js';
import { EventListenerClass } from '../events/EventListenerClass.js';
import { MenuOptions } from './interfaces/MenuOptions.js';
/**
 * The MenuComponent does all the work, it only needs
 * a Menu implementation and a target element to which
 * the html should be appended to
 */
export declare class MenuComponent extends EventListenerClass implements EventListenerObject {
    private menu$;
    private name$;
    private tabidx$;
    private active$;
    private focused;
    private target$;
    private options$;
    private open$;
    private entries$;
    private paths$;
    private menuentries$;
    private elements$;
    constructor(name: string, menu: Menu, options?: MenuOptions, target?: HTMLElement);
    get name(): string;
    get options(): MenuOptions;
    set options(options: MenuOptions);
    get target(): HTMLElement;
    set target(target: HTMLElement);
    focus(): void;
    hasOpenBranches(): boolean;
    show(): Promise<boolean>;
    private building;
    private showMenu;
    hide(): Promise<boolean>;
    close(): Promise<void>;
    private closeMenu;
    toggle(path: string): Promise<void>;
    findEntry(path: string): Promise<MenuEntry>;
    private findrecusv;
    private showEntry;
    handleEvent(event: Event): Promise<void>;
    private pick;
    private navigate;
    private navigateV;
    private navigateH;
    private findPrev;
    private findNext;
    private findFirstChild;
    private fireBlur;
    private fireFocus;
    private belongs;
    private setFocus;
    private removeFocus;
    private getElement;
    private index;
    private split;
    private prepare;
}
