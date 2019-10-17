"use strict";
const config = require( "./config" );

//fallback error codes
let messages = config.errors;

/**
 * class that handles generating valid and invalid API responses
 * @type {{isError: response.isError, isData: response.isData}}
 */
const response = {
	
	/**
	 * handles error responses and ends the request
	 * @param res {Object}
	 * @param code {Number}
	 * @param msg {{statusText: string, validations: *}}
	 */
	isError: ( res, code, msg ) => {
		if ( !code ) {
			throw new Error( "response.isError => called without passing the code value as the first parameter!" );
		}
		
		let message = msg || messages[ code ];
		
		if ( !message ) {
			throw new Error( "response.isError => Unable to generate an error message!" );
		}
		
		let headObj = {};
		headObj[ 'Content-Type' ] = 'application/json';
		res.writeHead( code, headObj );
		res.end( JSON.stringify( { "result": false, "errors": { "code": code, "msg": message } } ) );
	},
	
	/**
	 * handles valid responses and ends the request.
	 * @param res {Object}
	 * @param data {Object|Array|Number|String|Boolean|Undefined|Null}
	 */
	isData: ( res, data ) => {
		if ( !data ) {
			data = {};
		}
		
		let headObj = {};
		headObj[ 'Content-Type' ] = 'application/json';
		res.writeHead( 200, headObj );
		res.end( JSON.stringify( { "result": true, "data": data } ) );
	}
};

module.exports = response;