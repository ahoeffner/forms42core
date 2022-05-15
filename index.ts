const version = "2.1.1";
console.log("Version "+version);
export { Form } from './src/public/Form.js';
export { Block } from './src/public/Block.js';

export { Event } from './src/events/Events.js';
export { KeyMap } from './src/events/KeyMap.js';
export { KeyCodes } from './src/events/KeyCodes.js';
export { EventType } from './src/events/EventType.js';
export { EventFilter } from './src/events/EventFilter.js';

export { Class } from './src/types/Class.js';
export { Logger } from './src/application/Logger.js';
export { Properties } from './src/application/Properties.js';
export { Canvas, View } from './src/application/interfaces/Canvas';
export { HTMLFragment as Include } from './src/application/HTMLFragment.js';
export { ComponentFactory } from './src/application/interfaces/ComponentFactory.js';
export { Component, ModuleDefinition, FormsModule } from './src/application/FormsModule.js';

export { Menu } from './src/view/menus/interfaces/Menu.js';
export { StaticMenu } from './src/view/menus/StaticMenu.js';
export { MenuHandler } from './src/view/menus/MenuHandler.js';
export { MenuEntry } from './src/view/menus/interfaces/MenuEntry.js';
export { StaticMenuEntry } from './src/view/menus/interfaces/StaticMenuEntry.js';
