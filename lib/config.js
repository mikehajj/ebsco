"use strict";

const bFormat = require( 'bunyan-format' );
let streamFormat = {
	outputMode: 'short',
	level: 'debug',
	stream: process.stdout
};
let loggerConfig = bFormat( streamFormat );

const config = {
	//logger configuration
	logger: {
		level: 'debug',
		name: 'logger',
		stream: loggerConfig
	},
	
	//name of the engine to use
	engine: {
		name: 'google'
	},
	
	//global error codes for this application
	errors: {
		101: "Something Wen't wrong, please try again."
	},
	
	//json schema validatio rule for specific APIs
	schemas: {
		"/autocomplete": {
			"type": "object",
			"required": true,
			"properties": {
				"q": {
					"type": "string",
					"description": "The query term that the engine should use to search for.",
					"required": true,
					"minLength": 2
				}
			},
			"additionalProperties": false
		}
	}
};

module.exports = config;