import { Form } from "../Form.js";
export declare class Alert extends Form {
    private grap;
    private msg;
    private created;
    static WIDTH: number;
    static HEIGHT: number;
    static MAXWORDLEN: number;
    private closeButton;
    static BlurStyle: string;
    constructor();
    private done;
    private closeRunning;
    private initialize;
    focus(): Promise<boolean>;
    private split;
    private static prepare;
    static page: string;
}
