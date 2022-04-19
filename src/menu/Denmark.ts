import { StaticMenuEntry } from "./interfaces/StaticMenuEntry.js";

export class Denmark
{
    public data() : StaticMenuEntry
    {
        return(
        {
            id: "Danmark",
            text: "Danmark",
            active: true,
            entries:
            [
                {
                    id: "Jylland",
                    text: "Jylland",
                    active: true,
                    entries:
                    [
                        {
                            id: "Sønderborg",
                            text: "Sønderborg",
                            active: true,
                            command: "/soenderborg"
                        }
                        ,
                        {
                            id: "Århus",
                            text: "Århus",
                            active: true,
                            entries:
                            [
                                {
                                    id: "Syd",
                                    text: "Syd",
                                    active: true,
                                    command: "/aahus/syd"
                                }
                                ,
                                {
                                    id: "Nord",
                                    text: "Nord",
                                    active: true,
                                    command: "/aahus/nord"
                                }
                            ]
                        }
                        ,
                        {
                            id: "Skagen",
                            text: "Skagen",
                            active: true,
                            command: "/skagen"
                        }
                    ]
                }
                ,
                {
                    id: "Sjælland",
                    text: "Sjælland",
                    active: true,
                    entries:
                    [
                        {
                            id: "København",
                            text: "København",
                            active: true,
                            command: "/kopenhavn"
                        }
                        ,
                        {
                            id: "Hørsholm",
                            text: "Hørsholm",
                            active: true,
                            command: "/horsholm"
                        }
                    ]
                }
                ,
                {
                    id: "Fyn",
                    text: "Fyn",
                    active: true,
                    command: "/fyn"
                }
                ,
                {
                    id: "Øerne",
                    text: "Øerne",
                    active: true,
                    command: "/oerne"
                }
            ]
        });
    }
}