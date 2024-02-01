import { Form } from "../Form.js";
/**
 * Form used for creating more advanced query-filters
 */
export declare class QueryEditor extends Form {
    private type;
    private values;
    private options;
    private fltprops;
    private inclprops;
    constructor();
    private skip;
    private done;
    private setOptions;
    private setType;
    private navigate;
    private initialize;
    private insert;
    private showSingle;
    private showRange;
    private showMulti;
    private hideAll;
    private last;
    private first;
    static page: string;
}
