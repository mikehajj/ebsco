"use strict";

//requiring needed modules to set up an express application
const createError = require( 'http-errors' );
const express = require( 'express' );
const path = require( 'path' );
const bodyParser = require( 'body-parser' );

//creating new express application
const app = express();
const router = express.Router();

// view engine setup
app.set( 'views', path.join( __dirname, '/../', 'ui', 'views' ) );
app.set( 'view engine', 'hbs' );

//attaching middleware to express application
app.use( bodyParser.json() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( express.static( path.join( __dirname, '/../', 'ui', 'public' ) ) );

const serverless = require( path.join( __dirname, './lambda' ) );

/**
 * Specific route that handles the rendering of variables for UI purposes
 */
router.get( '/', ( req, res ) => {
	res.render( 'index', { title: 'EBSCO Suggestion App' } );
	
} );

/**
 * Specific route that handles the /autocomplete operation
 */
router.post( '/autocomplete', ( req, res ) => {
	
	( async () => {
		
		serverless.autocomplete( req ).then(output => {
			if ( output && typeof output === 'object' ) {
				res.writeHead( output.statusCode, output.headers );
				res.end( JSON.parse( output.body ) );
			}
			else {
				res.writeHead( 200, {} );
				res.end( '' );
			}
		});
		
	} )();
	
} );

//requiring router module to implement rest calls
app.use( router );

// catch 404 and forward to error handler
app.use( ( req, res, next ) => {
	next( createError( 404, 'Page or API not Found!' ) );
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
