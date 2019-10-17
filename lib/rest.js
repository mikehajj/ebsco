"use strict";
const path = require( 'path' );

const express = require( 'express' );
const router = express.Router();
const validate = require( 'express-jsonschema' ).validate;

const response = require( './response' );
const engine = require( path.join( __dirname, "engine/index.js" ) );

const config = require( './config' );
let driverName = config.engine.name;

/**
 * Specific route that handles the rendering of variables for UI purposes
 */
router.get( '/', ( req, res ) => {
	res.render( 'index', { title: 'EBSCO Suggestion App' } );
	
});

/**
 * Specific route that handles the /autocomplete operation
 */
router.post( '/autocomplete', validate( { body: config.schemas[ '/autocomplete' ] } ), [
	
	/**
	 * First middleware, checks to see if there is an engine that can be used to process the request.
	 * if Engine is found, attach it to the request and call second middleware
	 * @param req {Object}
	 * @param res {Object}
	 * @param next {Function}
	 */
		( req, res, next ) => {
		req.log.info( "Loading Engine ..." );
		
		//call the main engine loader and attempt to load the engine
		engine.load( driverName, ( error, myEngine ) => {
			if ( error ) {
				req.log.error( error );
				//return a handled error response
				return response.isError( res, 101, 'Unable to fetch a response at the moment.' );
			}
			
			req.log.info( `Engine ${driverName} loaded, proceeding with request...` );
			//attach engine to request
			req.myEngine = myEngine;
			
			//call second middleware
			next();
		} );
	},
	
	/**
	 * Second middleware, invokes the execute method of the loaded engine and formulates and returns a response
	 * @param req {Object}
	 * @param res {Object}
	 */
		( req, res ) => {
		
		//call the execute engine method, pass on the query string
		req.myEngine.autocomplete( req, ( error, data ) => {
			if ( error ) {
				req.log.error( error );
				//return a handled error response
				return response.isError( res, error.code || 101, null );
			}
			
			//return a valid response
			req.log.info("Returning Response ...");
			return response.isData( res, data );
		} );
	}
] );

module.exports = router;
