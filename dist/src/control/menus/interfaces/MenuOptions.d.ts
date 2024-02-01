export declare enum Navigation {
    vertical = 0,
    horizontal = 1
}
/**
 * Options for menu-display
 */
export interface MenuOptions {
    skiproot?: boolean;
    openroot?: boolean;
    multipleOpen?: boolean;
    openOnHoover?: boolean;
    navigation?: Navigation;
}
