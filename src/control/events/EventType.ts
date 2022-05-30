export enum EventType
{
	Key,
	Mouse,

	Connect,
	Disconnect,

	NewForm,
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
