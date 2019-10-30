"use strict";

//requiring needed modules to set up an express application
const createError = require( 'http-errors' );
const express = require( 'express' );
const path = require( 'path' );
const bodyParser = require( 'body-parser' );

const validate = require( 'express-jsonschema' ).validate;
const config = require( path.join( __dirname, '/../', 'config', 'index' ) );
const logger = new require( 'bunyan' )( config.logger );

//creating new express application
const app = express();
const router = express.Router();

// view engine setup
app.set( 'views', path.join( __dirname, 'ui', 'views' ) );
app.set( 'view engine', 'hbs' );

//attaching middleware to express application
app.use( bodyParser.json() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( express.static( path.join( __dirname, 'ui', 'public' ) ) );

//require custom application files
const businessLogic = require( path.join( __dirname, '/../', 'lib', 'bl' ) );
const response = require( path.join( __dirname, '../', 'lib', 'response' ) );

/**
 * Specific route that handles the rendering of variables for UI purposes
 */
router.get( '/', ( req, res ) => {
	res.render( 'index', { title: 'EBSCO Suggestion App' } );
	
} );

/**
 * Specific route that handles the /autocomplete operation
 */
router.post( '/autocomplete', validate( { body: config.schemas[ '/autocomplete' ] } ), [
	/**
	 * First middleware, initializes the logger and attaches it to the request along with the config.
	 * @param req {Object}
	 * @param res {Object}
	 * @param next {Function}
	 */
		( req, res, next ) => {
		req.log = logger;
		req.config = config;
		next();
	},
	
	/**
	 * Second middleware, checks to see if there is an engine that can be used to process the request.
	 * if Engine is found, attach it to the request and call second middleware
	 * @param req {Object}
	 * @param res {Object}
	 * @param next {Function}
	 */
		( req, res, next ) => {
		
		businessLogic.loadEngine( req, ( error ) => {
			if ( error ) {
				return response.isError( res, error.code, error.message );
			}
			next();
		} );
	},
	
	/**
	 * Third middleware, invokes the execute method of the loaded engine and formulates and returns a response
	 * @param req {Object}
	 * @param res {Object}
	 */
		( req, res ) => {
		
		businessLogic.executeEngineCommand( req, ( error, data ) => {
			if ( error ) {
				return response.isError( res, error.code, error.data );
			}
			
			return response.isData( res, data );
		} );
	}
] );

//requiring router module to implement rest calls
app.use( router );

// catch 404 and forward to error handler
app.use( ( req, res, next ) => {
	next( createError( 404, 'Page or API not Found!' ) );
} );

//express-json schema error handler
app.use( ( err, req, res, next ) => {
	
	//check if error is in the schema ...
	if ( err.name === 'JsonSchemaValidation' ) {
		let responseData = {
			statusText: 'Bad Request',
			validations: err.validations  // All of the validation information
		};
		response.isError( res, 401, responseData );
	}
	else {
		// pass error to next error middleware handler
		next( err );
	}
} );

// default error handler
app.use( ( err, req, res, next ) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};
	
	// render the error page
	res.status( err.status || 500 );
	res.render( 'error' );
} );

module.exports = app;
