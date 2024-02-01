import { Level } from "./Messages";
import { Message } from "./interfaces/Message";
export interface MessageHandler {
    handle(msg: Message, level: Level): boolean | Promise<boolean>;
}
