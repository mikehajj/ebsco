"use strict";

const assert = require( "assert" );
const request = require( "request" );

const { spawn } = require( 'child_process' );

describe( "Testing Autocomplete API", () => {
	let expressApp;
	
	/**
	 * Start the express App server
	 */
	before( ( done ) => {
		expressApp = spawn( "npm", [ "start" ], {
			cwd: __dirname,
			env: process.env,
			stdio: [ 'inherit', 'inherit', 'inherit' ]
		} );
		
		setTimeout(() => {
			done();
		}, 2000);
	} );
	
	/**
	 * Stop the express App server
	 */
	after( ( done ) => {
		expressApp.kill( 'SIGTERM' );
		expressApp.on( 'close', ( code ) => {
			console.log( `child process exited with code ${ code }` );
			done();
		} );
	} );
	
	/**
	 * Execute some test cases
	 */
	it( "Success - Sending Beirut and receiving success API response", ( done ) => {
		
		let options = {
			method: 'GET',
			uri: "http://localhost:3000/autocomplete",
			timeout: 30000,
			json: true,
			form: {
				q: "beirut"
			}
		};
		console.log( `\nInvoking 3rd Party systems with:`, JSON.stringify( options ) );
		request.post( options, ( error, response, body ) => {
			assert.ifError(error);
			assert.ok(response);
			assert.ok(body);
			assert.equal(body.result, true);
			assert.ok(body.data);
			done();
		} );
		
	} );
	
	it( "Fail - Sending invalid inputs and receiving invalid API response", ( done ) => {
		
		let options = {
			method: 'GET',
			uri: "http://localhost:3000/autocomplete",
			timeout: 30000,
			json: true,
			form: {
				q: "beirut",
				a: "b"
			}
		};
		console.log( `\nInvoking 3rd Party systems with:`, JSON.stringify( options ) );
		request.post( options, ( error, response, body ) => {
			assert.ifError(error);
			assert.ok(response);
			assert.ok(body);
			assert.equal(body.result, false);
			assert.ok(body.errors);
			assert.equal(body.errors.code, 401);
			assert.ok(body.errors.msg.validations);
			done();
		} );
		
	} );
	
} );