import { MenuEntry } from "./MenuEntry.js";
/**
 * Addon to the more general MenuEntry
 */
export interface StaticMenuEntry extends MenuEntry {
    entries?: StaticMenuEntry[];
}
