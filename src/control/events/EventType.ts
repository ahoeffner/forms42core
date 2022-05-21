export enum EventType
{
	Key,
	Mouse,

	Connect,
	Disconnect,

	PreForm,
	PostForm,

    PreField,
    PostField,

	Editing,
	ValidateField,

    NextField,
    NextBlock,
	PreviousField,
    PreviousBlock,

    PreRecord,
    PostRecord,

	PreQuery,
    PostQuery,

    PreInsert,
    PostInsert,

    PreUpdate,
    PostUpdate,

    PreDelete,
    PostDelete,

    LockRecord,
	ValidateRecord
}
