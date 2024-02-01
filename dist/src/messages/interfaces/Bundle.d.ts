import { Group } from "./Group.js";
import { Message } from "./Message.js";
export interface Bundle {
    lang: string;
    name: string;
    groups: Group[];
    messages: Message[];
}
