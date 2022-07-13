export enum EventType
{
	Key,
	Mouse,

	Connect,
	Disconnect,

	FormInit,
	FormClose,

	PreForm,
	PostForm,

	PreBlock,
	PostBlock,

    PreField,
    PostField,

	Editing,
	ValidateField,

    PreRecord,
    PostRecord,

	PreQuery,
    PostFetch,
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
