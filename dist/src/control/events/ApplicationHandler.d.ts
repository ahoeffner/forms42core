import { KeyMap } from './KeyMap.js';
import { MouseMap } from './MouseMap.js';
export declare class ApplicationHandler implements EventListenerObject {
    static contextmenu: boolean;
    static instance: ApplicationHandler;
    static init(): void;
    static addContextListener(): void;
    private constructor();
    private event;
    handleEvent(event: any): Promise<void>;
    keyhandler(key: KeyMap): Promise<boolean>;
    mousehandler(_mevent: MouseMap): Promise<boolean>;
    private addEvents;
}
