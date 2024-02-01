export declare class Loading {
    static SHORTWHILE: number;
    private static loader;
    private threads;
    private displayed;
    private view;
    private element;
    private jobs;
    static show(message: string): number;
    static hide(thread: number): void;
    private start;
    private display;
    private remove;
    private prepare;
    private getOldest;
    private watch;
    static page: string;
}
