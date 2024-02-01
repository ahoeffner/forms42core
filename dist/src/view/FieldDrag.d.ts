import { Form } from "./Form.js";
export declare class FieldDrag implements EventListenerObject {
    private form;
    private header;
    private cursor;
    private column;
    private current;
    private target;
    private instance;
    constructor(form: Form, header: HTMLElement);
    start(): void;
    handleEvent(event: MouseEvent): void;
    private move;
    private check;
    private findInstance;
    private getID;
    private getinstances;
}
