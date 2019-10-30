"use strict";
const async = require( "async" );
const request = require( "request" );
const xmlParser = require( "xml2js" ).parseString;

/**
 * Google Driver for /complete/search API
 * @type {{execute: Google.execute}}
 */
const Google = {
	
	/**
	 * Driver Autocomplete Method, execute API call, fetches and parses XML response and return it as JSON
	 * @param context {Object}
	 * @param cb {Function}
	 */
	autocomplete: ( context, cb ) => {
		
		let googleURI = "http://google.com/complete/search";
		
		//async tasks to execute
		const tasks = {
			
			//task 1: call google and the response
			"Call Google": ( aCb ) => {
				
				let options = {
					method: 'GET',
					uri: googleURI,
					timeout: 30000,
					qs: {
						output: "toolbar",
						q: context.body.q
					}
				};
				context.log.debug( `Invoking 3rd Party systems with:`, JSON.stringify( options, null, 2 ) );
				request.get( options, ( error, response, body ) => {
					if ( error ) {
						context.log.error( error );
						return aCb( new Error( "Error fetching response from google/complete/search!" ) );
					}
					
					if ( !body ) {
						return aCb( new Error( "No response received from google/complete/search!" ) );
					}
					
					return aCb( null, body );
				} );
			},
			
			//task 2: if response is JSON, skip else parse and return response
			"Parse Response": ["Call Google", ( info, aCb ) => {
				let response = info[ 'Call Google' ];
				
				if ( typeof ( response ) !== 'object' ) {
					xmlParser( response, ( error, result ) => {
						if ( error ) {
							context.log.error( error );
							return aCb( new Error( "Error Parsing Response from google/complete/search!" ) );
						}
						
						return aCb( null, result );
					} );
				}
				else {
					return aCb( null, response );
				}
			}],
			
			//task 3: formulate and populate the response
			"Formulate Return Response": ["Parse Response", ( info, aCb ) => {
				let result = info[ "Parse Response" ];
				let output = [];
				
				context.log.debug( "Parsing response and populating output ..." );
				if ( result && result[ 'toplevel' ] && result[ 'toplevel' ][ 'CompleteSuggestion' ] ) {
					
					async.each( result[ 'toplevel' ][ 'CompleteSuggestion' ], ( oneSuggestion, eCb ) => {
						if ( oneSuggestion && oneSuggestion[ 'suggestion' ] && oneSuggestion[ 'suggestion' ][ 0 ] && oneSuggestion[ 'suggestion' ][ 0 ][ '$' ] && oneSuggestion[ 'suggestion' ][ 0 ][ '$' ][ 'data' ] ) {
							if ( !output.includes( oneSuggestion[ 'suggestion' ][ 0 ][ '$' ][ 'data' ] ) ) {
								if(oneSuggestion[ 'suggestion' ][ 0 ][ '$' ][ 'data' ] !== context.body.q){
									output.push( oneSuggestion[ 'suggestion' ][ 0 ][ '$' ][ 'data' ] );
								}
							}
						}
						return eCb();
					}, () => {
						return aCb( null, output );
					} )
				}
				else {
					return aCb( null, output );
				}
				
			}]
		};
		
		//run the tasks, get the data, parse the response and return an output
		async.auto( tasks, ( error, results ) => {
			if ( error ) {
				return cb( error );
			}
			
			//return output
			return cb( null, results[ 'Formulate Return Response' ] );
		} );
	}
	
};

module.exports = Google;