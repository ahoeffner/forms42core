export class MSGGRP
{
	public static TRX:number = 5000; 		// Transactions
	public static SQL:number = 5010; 		// Propagate messages from database
	public static CONN:number = 5050; 		// Connections
	public static ORDB:number = 5060;		// Propagate messages from OpenRestDB
	public static FRAMEWORK:number = 5100; // Internal framework messages
}