import { Menu } from "./interfaces/Menu.js";
import { MenuEntry } from "./interfaces/MenuEntry.js";
import { StaticMenuEntry } from "./interfaces/StaticMenuEntry.js";
/**
 * An easy to use scaffolding of a static Menu.
 * Just implement the execute method that occurs
 * when a given menu-entry is choosen.
 */
export declare abstract class StaticMenu implements Menu {
    entries: StaticMenuEntry;
    private root;
    private menu;
    constructor(entries: StaticMenuEntry);
    getRoot(): Promise<MenuEntry>;
    getEntries(path: string): Promise<MenuEntry[]>;
    abstract execute(path: string): Promise<boolean>;
    index(path: string, entry: StaticMenuEntry): void;
}
