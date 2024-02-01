import { EventType } from "./EventType.js";
import { MenuComponent } from "../menus/MenuComponent.js";
/**
 * Data class that holds information
 * about what and where a menu event occured
 */
export interface MenuEvent {
    type: EventType;
    menu: MenuComponent;
}
