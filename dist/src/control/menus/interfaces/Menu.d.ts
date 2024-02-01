import { MenuEntry } from "./MenuEntry.js";
/**
 * The basic definition of a Menu.
 * Any class implementing the interface
 * can be used as a Menu
 */
export interface Menu {
    getRoot(): Promise<MenuEntry>;
    getEntries(path: string): Promise<MenuEntry[]>;
    execute(path: string): Promise<boolean>;
}
