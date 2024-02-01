import { Canvas } from './interfaces/Canvas.js';
export interface CanvasComponent {
    canvas: Canvas;
    moveable: boolean;
    resizable: boolean;
    getView(): HTMLElement;
    close(): Promise<boolean>;
}
