export class MSGGRP
{
	public static TRX:number = 5000; 		// Transactions
	public static SQL:number = 5010; 		// Propagate messages from database
	public static ORDB:number = 5060;		// Propagate messages from OpenRestDB
	public static FORM:number = 5070;		// Form messages
	public static BLOCK:number = 5080;		// Block messages
	public static FRAMEWORK:number = 5100; // Internal framework messages
}