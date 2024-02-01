import { Form } from "../Form.js";
/**
 * A simple utillity form for prompting
 * for username / password
 */
export declare class UsernamePassword extends Form {
    title: string;
    username: string;
    password: string;
    accepted: boolean;
    static scope: boolean;
    static database: boolean;
    static LoginButtonText: string;
    static CancelButtonText: string;
    constructor();
    cancel(): Promise<boolean>;
    private accept;
    private initialize;
    private static prepare;
    static page: string;
}
