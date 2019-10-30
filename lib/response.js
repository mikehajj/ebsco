"use strict";
const path = require( 'path' );
const config = require( path.join( __dirname, "/../", 'config', "index" ) );

//fallback error codes
let messages = config.errors;

/**
 * class that handles generating valid and invalid API responses
 * @type {{isError: response.isError, isData: response.isData}}
 */
const response = {
	
	/**
	 * handles error responses and ends the request
	 * @param code {Number}
	 * @param msg {{statusText: string, validations: *}}
	 */
	isError: ( code, msg ) => {
		
		let headObj = {}, response = {};
		headObj[ 'Content-Type' ] = 'application/json';
		
		if ( !code ) {
			response.error = new Error( "response.isError => called without passing the code value as the first parameter!" );
		}
		
		let message = msg || messages[ code ];
		
		if ( !message ) {
			response.error = new Error( "response.isError => Unable to generate an error message!" );
		}
		
		return {
			code: code,
			header: headObj,
			response: JSON.stringify( { "result": false, "errors": { "code": code, "msg": message } } )
		}
	},
	
	/**
	 * handles valid responses and ends the request.
	 * @param data {Object|Array|Number|String|Boolean|Undefined|Null}
	 */
	isData: ( data ) => {
		if ( !data ) {
			data = {};
		}
		
		let headObj = {};
		headObj[ 'Content-Type' ] = 'application/json';
		
		return {
			code: 200,
			header: headObj,
			response: JSON.stringify( { "result": true, "data": data } )
		}
	}
};

module.exports = response;