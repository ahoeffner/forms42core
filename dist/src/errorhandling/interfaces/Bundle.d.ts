import { Group } from "./Group.js";
import { Message } from "./Message.js";
export declare abstract class Bundle {
    lang: string;
    abstract name: string;
    abstract groups: Group[];
    abstract messages: Message[];
}
