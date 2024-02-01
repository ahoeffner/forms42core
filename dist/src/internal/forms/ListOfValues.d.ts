import { Form } from "../Form.js";
export declare class ListOfValues extends Form {
    private form;
    private last;
    private block;
    private results;
    private columns;
    private cancelled;
    private lov;
    static DELAY: number;
    constructor();
    accepted(): boolean;
    private skip;
    private done;
    private onKeyStroke;
    private query;
    private navigate;
    private onFetch;
    private initialize;
    private initcap;
    private addListeners;
    static page: string;
}
