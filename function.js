/***********************************************************************
 *
 * Google cloud function support
 *
 ***********************************************************************/
"use strict";

const path = require( "path" );
const async = require( "async" );

const config = require( path.join( __dirname, '/./', 'config', 'index' ) );
const logger = new require( 'bunyan' )( config.logger );

const businessLogic = require( path.join( __dirname, '/./', 'lib', 'bl' ) );
const response = require( path.join( __dirname, '/./', 'lib', 'response' ) );

const Validator = require( 'jsonschema' ).Validator;
var validate = new Validator();

/**
 * Specific route that handles the autocomplete operation using serverless architecture
 */
exports.autocomplete = ( req, res ) => {
	
	const tasks = {
		/**
		 * First middleware, initializes the logger and attaches it to the request along with the config.
		 * @param next {Function}
		 */
		"trapRequestAndInject": ( next ) => {
			req.log = logger;
			req.config = config;
			return next();
		},
		
		/**
		 * Second middleware, checks and validates the incoming inputs from the body against a json schema
		 * @param next
		 * @returns {*}
		 */
		"imfv": ( next ) => {
			
			//check if the inputs have the correct schema
			let validationResult = validate.validate( req.body, config.schemas[ '/autocomplete' ] );
			
			//if no errors at all
			if ( validationResult.errors.length === 0 ) {
				return next();
			}
			
			let IMFVerrors = [];
			validationResult.errors.forEach( ( oneIMFVError ) => {
				IMFVerrors.push( `${ oneIMFVError.stack }` );
			} );
			
			return next( {
				             code: 401,
				             message: {
					             statusText: 'Bad Request',
					             validations: new Error( IMFVerrors.join( "\n" ) ).message  // All of the validation information
				             }
			             } );
		},
		
		/**
		 * Third middleware, checks to see if there is an engine that can be used to process the request.
		 * if Engine is found, attach it to the request and call second middleware
		 * @param next {Function}
		 */
		"loadEngine": ( next ) => {
			businessLogic.loadEngine( req, ( error ) => {
				if ( error ) {
					return next( { code: error.code, message: error.message } );
				}
				return next( null, true );
			} );
		},
		
		/**
		 * Forth middleware, invokes the execute method of the loaded engine and formulates and returns a response
		 * @param next {Function}
		 */
		"invokeEngine": ( next ) => {
			businessLogic.executeEngineCommand( req, ( error, data ) => {
				if ( error ) {
					return next( { code: error.code, message: error.message } );
				}
				return next( null, data );
			} );
		}
		
	};
	
	async.series( tasks, ( error, data ) => {
		
		let apiReponse = {
			statusCode: 0,
			body: '',
		};
		
		let output = {};
		
		if ( error ) {
			output = response.isError( error.code, error.message );
		}
		else {
			output = response.isData( data[ 'invokeEngine' ] );
		}
		
		output.body = JSON.stringify( output.response );
		
		res.set('Access-Control-Allow-Origin', "*");
		res.set('Access-Control-Allow-Methods', 'GET, POST');
		res.status(output.code).type(output.header['Content-Type']).end( JSON.parse( output.body ) );
	} );
};