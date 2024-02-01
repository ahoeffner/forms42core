import { CanvasComponent } from '../CanvasComponent.js';
export interface View {
    x: string | number;
    y: string | number;
    width: string | number;
    height: string | number;
}
/**
 * Forms must be placed on a canvas that provides basic
 * functionality across all types of forms. It is possible
 * to replace the default implementation of the Canvas, implementing
 * this interface and injecting the custom Canvas class.
 */
export interface Canvas {
    zindex: number;
    moveable: boolean;
    resizable: boolean;
    close(): void;
    block(): void;
    unblock(): void;
    remove(): void;
    restore(): void;
    activate(): void;
    replace(page: HTMLElement): void;
    attach(parent: HTMLElement): void;
    getView(): HTMLElement;
    getContent(): HTMLElement;
    getViewPort(): View;
    getParentViewPort(): View;
    setViewPort(view: View): void;
    getComponent(): CanvasComponent;
    setComponent(component: CanvasComponent): void;
    getElementById(id: string): HTMLElement;
    getElementByName(name: string): HTMLElement[];
}
