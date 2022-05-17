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
	PostChange,

    NextField,
    NextBlock,
	PreviousField,
    PreviousBlock,

    PreRecord,
    PostRecord,

	PreQuery,
    PostQuery,
    PreInsert,
    PreUpdate,
    PreDelete,

    LockRecord,
	ValidateRecord
}
