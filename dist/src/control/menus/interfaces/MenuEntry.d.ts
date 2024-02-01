/**
 * Definition of a Menu entry.
 * If command is defined, then the Menu execute method
 * is called with this command as the argument
 */
export interface MenuEntry {
    id: any;
    display: string;
    command?: string;
    hinttext?: string;
    disabled?: boolean;
}
