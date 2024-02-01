/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { InternalUS } from "./InternalUS.js";
import { Alert } from "../application/Alert.js";
export class Messages {
    static files$ = [];
    static language$ = null;
    static groups$ = new Map();
    static messages$ = new Map();
    /** all messages language */
    static set language(language) {
        if (!Messages.language$) {
            // Add internal bundles
            Messages.addBundle(new InternalUS());
        }
        Messages.language$ = language.toUpperCase();
        this.files$.forEach((bundle) => {
            if (bundle.lang == Messages.language)
                Messages.load(bundle);
        });
    }
    /** all messages language */
    static get language() {
        return (Messages.language$);
    }
    /** Add message bundle */
    static addBundle(bundle) {
        if (!Messages.files$.includes(bundle))
            Messages.files$.push(bundle);
        bundle.lang = bundle.lang.toUpperCase();
        if (bundle.lang == Messages.language)
            Messages.load(bundle);
    }
    static get bundles() {
        return (Messages.files$);
    }
    static async info(grpno, errno) {
        await Messages.show(grpno, errno, Level.info);
    }
    static getGroup(grpno) {
        return (Messages.groups$.get(grpno));
    }
    static getMessage(grpno, errno) {
        let msg = null;
        let group = Messages.messages$.get(grpno);
        if (group)
            msg = group.get(errno);
        return (msg);
    }
    static async show(grpno, errno, level) {
        let group = Messages.getGroup(grpno);
        let msg = Messages.getMessage(grpno, errno);
        if (!msg)
            msg =
                {
                    grpno: grpno,
                    errno: errno,
                    title: "Missing message",
                    message: "Unknow error number '" + errno + "' in group'" + grpno + "'"
                };
        else {
            msg = { ...msg };
            if (!msg.title)
                msg.title = group.title;
        }
        Alert.handle(msg);
    }
    static load(bundle) {
        bundle?.groups.forEach((group) => {
            Messages.groups$.set(group.grpno, group);
            let msgs = Messages.messages$.get(group.grpno);
            if (!msgs)
                Messages.messages$.set(group.grpno, new Map());
        });
        bundle?.messages.forEach((msg) => {
            let group = Messages.messages$.get(msg.grpno);
            if (group)
                group.set(msg.errno, msg);
        });
    }
}
export var Level;
(function (Level) {
    Level[Level["fine"] = 0] = "fine";
    Level[Level["info"] = 1] = "info";
    Level[Level["warn"] = 2] = "warn";
    Level[Level["fatal"] = 3] = "fatal";
})(Level || (Level = {}));
