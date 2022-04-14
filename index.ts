const version = "2.1.1";
console.log("Version "+version);
export { Form } from './src/forms/Form.js';

export { Event } from './src/events/Events.js';
export { EventType } from './src/events/EventType.js';
export { EventFilter } from './src/events/EventFilter.js';

export { Class } from './src/types/Class.js';
export { Logger } from './src/application/Logger.js';
export { Properties } from './src/application/Properties.js';
export { Canvas, View } from './src/application/interfaces/Canvas';
export { HTMLFragment as Include } from './src/application/HTMLFragment.js';
export { ComponentFactory } from './src/application/interfaces/ComponentFactory.js';
export { Component, ModuleDefinition, FormsModule } from './src/application/FormsModule.js';
