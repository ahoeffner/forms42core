/**
    Form triggers fire in context of a form and block.
    Triggers fires first at field level, then block and form level.

    Two or more form triggers cannot run simultaneously in that context.
    E.G. you cannot delete a row while navigating in the same block.

    A few select triggers are considered safe for further action.

    Triggers that fire before anything else happens in the form I.E. onNewForm and PostViewInit.
    And PostChange, that fires after everything else when modifying a field.


    In general if a trigger returns false, execution stops. On top of this

    On-triggers prevents the event to happen.
    When-triggers marks the row/field invalid.


    Non form triggers like PreCommit is not restricted, but should be used with great care.
*/
export declare enum EventType {
    Key = 0,
    Mouse = 1,
    Custom = 2,
    WhenMenuBlur = 3,
    WhenMenuFocus = 4,
    Connect = 5,
    Disconnect = 6,
    PreCommit = 7,
    PostCommit = 8,
    PreRollback = 9,
    PostRollback = 10,
    OnLockRecord = 11,
    OnRecordLocked = 12,
    OnTransaction = 13,
    OnNewForm = 14,
    OnCloseForm = 15,
    OnFormEnabled = 16,
    OnFormDisabled = 17,
    PostViewInit = 18,
    PostCloseForm = 19,
    PreForm = 20,
    PostForm = 21,
    PreBlock = 22,
    PostBlock = 23,
    PreRecord = 24,
    PostRecord = 25,
    OnRecord = 26,
    PreField = 27,
    PostField = 28,
    PostChange = 29,
    OnEdit = 30,
    WhenValidateField = 31,
    OnFetch = 32,
    PreQuery = 33,
    PostQuery = 34,
    OnCreateRecord = 35,
    PreInsert = 36,
    PostInsert = 37,
    PreUpdate = 38,
    PostUpdate = 39,
    PreDelete = 40,
    PostDelete = 41,
    WhenValidateRecord = 42
}
export declare class EventGroup {
    private types;
    static FormEvents: EventGroup;
    static ApplEvents: EventGroup;
    constructor(types: EventType[]);
    has(type: EventType): boolean;
}
