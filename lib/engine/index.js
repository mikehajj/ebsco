"use strict";

const fs = require("fs");
const path = require("path");

/**
 * engine loader, checks to see if the requested engine has a driver and if it does, it loads it.
 * once the engine is loaded, it checks to see if there is an execute method otherwise returns an error.
 * if engine and engine.execute, return the engine as the second parameter in the callback.
 * @type {{load: engine.load}}
 */
const engine = {
	load: ( drivername, cb ) => {
	
		let enginePath = path.join(__dirname, 'drivers', drivername + ".js");
		
		fs.exists(enginePath, (exists) => {
			
			if(!exists){
				return cb(new Error(`Engine ${drivername} was not found!`));
			}
			
			//force delete from cache
			delete require.cache[require.resolve(enginePath)];
			let myEngine = require(enginePath);
			
			if(!myEngine){
				return cb(new Error(`Failed to load engine ${drivername}!`));
			}
			
			if(Object.keys(myEngine).length === 0){
				return cb(new Error(`Engine file ${drivername} found and loaded, but no execute method detected!`));
			}
			
			return cb(null, myEngine);
		});
	}
};

module.exports = engine;