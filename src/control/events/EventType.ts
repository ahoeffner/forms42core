export enum EventType
{
	Key,
	Mouse,

	Connect,
	Disconnect,

	PostViewInit,
	PreCloseForm,

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
