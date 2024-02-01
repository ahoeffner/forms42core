/**
 * Forms must be placed on a canvas. This is to ensure that the form can be blocked
 * when for instance a LOV is active. It also provides means for moving, hiding etc.
 *
 * Some styling of the canvas is necessary but made public through this class.
 * It is also possible for expert users to replace the canvas class completely if needed.
 */
export declare class Canvas {
    static page: string;
    static CanvasStyle: string;
    static ModalStyle: string;
    static ContentStyle: string;
    static ModalClasses: string;
    static CanvasClasses: string;
    static ContentClasses: string;
    static CanvasHandleClass: string;
}
