"use strict";

//requiring needed modules to set up an express application
const createError = require( 'http-errors' );
const express = require( 'express' );
const path = require( 'path' );
const bodyParser = require( 'body-parser' );

//creating new express application
const app = express();

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'hbs' );

//attaching middleware to express application
app.use( bodyParser.json() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );

//require custom application files
const indexRouter = require( './lib/rest' );
const response = require( './lib/response' );

//requiring router module to implement rest calls
app.use( indexRouter );

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
