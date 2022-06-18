const version = "2.1.1";
console.log("Version "+version);
export { Form } from './src/public/Form.js';
export { Block } from './src/public/Block.js';

export { KeyMap } from './src/control/events/KeyMap.js';
export { KeyCodes } from './src/control/events/KeyCodes.js';
export { EventType } from './src/control/events/EventType.js';
export { EventFilter } from './src/control/events/EventFilter.js';
export { FormEvent as Event } from './src/control/events/FormEvents.js';

export { Class } from './src/types/Class.js';
export { Logger } from './src/application/Logger.js';
export { Properties } from './src/application/Properties.js';
export { Canvas, View } from './src/application/interfaces/Canvas';
export { HTMLFragment as Include } from './src/application/HTMLFragment.js';
export { ComponentFactory } from './src/application/interfaces/ComponentFactory.js';
export { Component, BaseURL, FormsPathMapping, FormsModule } from './src/application/FormsModule.js';

export { Menu } from './src/control/menus/interfaces/Menu.js';
export { StaticMenu } from './src/control/menus/StaticMenu.js';
export { MenuHandler } from './src/control/menus/MenuHandler.js';
export { MenuEntry } from './src/control/menus/interfaces/MenuEntry.js';
export { StaticMenuEntry } from './src/control/menus/interfaces/StaticMenuEntry.js';
