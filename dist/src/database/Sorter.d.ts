import { Form } from "../public/Form";
export declare class Sorter {
    private form;
    private sections;
    constructor(form: Form);
    /** toggle column asc/desc */
    toggle(block: string, column: string): Sorter;
    /** clause: col1, col2 desc, ..." */
    setFixed(block: string, clause: string): Sorter;
    /** clause: col1, col2 desc, ..." */
    setOrder(block: string, clause: string): Sorter;
    /** sort the block */
    sort(block: string): Promise<boolean>;
    private getSection;
}
