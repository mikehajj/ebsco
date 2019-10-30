"use strict";

const path = require( 'path' );
const engine = require( path.join( __dirname, "engine/index.js" ) );

const BusinessLogic = {
	
	/**
	 * checks to see if there is an engine that can be used to process the request.
	 * if Engine is found, attach it to the context
	 * @param context {Object}
	 * @param callback {Function}
	 */
	"loadEngine": (context, callback) => {
		
		context.log.info( "Loading Engine ..." );
		let driverName = context.config.engine.name;
		
		//call the main engine loader and attempt to load the engine
		engine.load( driverName, ( error, myEngine ) => {
			if ( error ) {
				context.log.error( error );
				//return a handled error response
				return callback({"code": 101, "message": 'Unable to fetch a response at the moment.'});
			}
			
			context.log.info( `Engine ${driverName} loaded, proceeding with request...` );
			//attach engine to request
			context.myEngine = myEngine;
			
			//call second middleware
			return callback();
		} );
	},
	
	/**
	 * invokes the execute method of the loaded engine and formulates and returns a response
	 * @param context {Object}
	 * @param callback {Function}
	 */
	"executeEngineCommand": (context, callback) => {
		
		//call the execute engine method, pass on the query string
		context.myEngine.autocomplete( context, ( error, data ) => {
			if ( error ) {
				context.log.error( error );
				//return a handled error response
				return callback({"code": 101});
			}
			
			//return a valid response
			context.log.info("Returning Response ...");
			return callback(null, data);
		} );
	}
};

module.exports = BusinessLogic;