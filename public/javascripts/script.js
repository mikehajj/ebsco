/**
 * This class contains all the needed methods to execute a search, highlight and reset the suggestions fetched.
 * @type {{highlight: suggestions.highlight, suggest: suggestions.suggest, autocomplete: suggestions.autocomplete, reset: suggestions.reset}}
 */
const suggestions = {
	
	/**
	 * if the keywords length in the input is 2 and above, do search.
	 */
	suggest: () => {
		let keywords = jQuery( "#keywords" ).val();
		if ( keywords.length >= 2 ) {
			suggestions.autocomplete( keywords );
		}
	},
	
	/**
	 * Call the API, get the search list, populate the suggestions and attach the highlight effect
	 * @param keywords
	 */
	autocomplete: ( keywords ) => {
		let requestOptions = {
			method: "POST",
			url: "http://localhost:3000/autocomplete",
			data: { q: keywords }
		};
		
		let request = jQuery.ajax( requestOptions );
		request.done( ( msg ) => {
			if ( msg && msg.result ) {
				let list = jQuery( "#suggestions" );
				msg.data.forEach( ( oneOption ) => {
					list.append( `<a class="list-group-item list-group-item-action" onmouseover="suggestions.highlight(this)" onmouseleave="suggestions.highlight(this)" onclick="suggestions.reset('${oneOption}');">${oneOption}</a>` )
				} );
				
				setTimeout( () => {
					suggestions.highlight();
				}, 10 );
			}
			else {
				printError( 200, msg );
			}
		} );
		
		request.fail( ( jqXHR, status ) => {
			printError( jqXHR.status, jqXHR.responseJSON );
		} );
	},
	
	/**
	 * reset the keyword with the passed parameter.
	 * reset the suggestions list
	 * trigger search again
	 * @param keywords
	 */
	reset: ( keywords ) => {
		if ( keywords && keywords.length > 0 ) {
			jQuery( "#keywords" ).val( keywords );
		}
		else {
			keywords = jQuery( "#keywords" ).val();
		}
		jQuery( "#searchOutput" ).html( "" );
		jQuery( "#suggestions" ).html( "" );
		suggestions.suggest( keywords );
	},
	
	/**
	 * attach highlight effect
	 * @param el
	 */
	highlight: ( el ) => {
		if ( jQuery( el ).hasClass( 'active' ) ) {
			jQuery( el ).attr( 'class', 'list-group-item list-group-item-action' );
		}
		else {
			jQuery( el ).attr( 'class', 'list-group-item list-group-item-action active' );
		}
	}
	
};

/**
 * Method that prints an error message in a red division using bootstrap error tag.
 * @param errorRepsonseObj {Object}
 */
function printError( code, errorRepsonseObj ) {
	
	//case of IMFV error
	if ( errorRepsonseObj && errorRepsonseObj.msg && errorRepsonseObj.msg.statusText === "Bad Request" ) {
		console.log( "Error: ", errorRepsonseObj );
	}
	
	jQuery( "#searchOutput" ).append( `<div class="alert alert-danger text-center" role="alert">Something went wrong while executing your query. Please try again and if the problem persists, contact the Administrator.</div>` );
}

/**
 * Attach listeners to inputs once the document has finished loading.
 */
jQuery( document ).ready( () => {
	
	let suggestionBox = `<div class="input-group mb-3">
																<!-- input that holds the keywords to search for -->
																<input type="text" id="keywords" class="form-control" placeholder="Type to search ..." />
																<!-- input that holds the button to execute search on click events -->
																<div class="input-group-append">
																	<button class="btn btn-primary-secondary btn-primary" type="button" id="search">Search</button>
																</div>
															</div>
															<!-- suggestions container -->
															<div id="suggestions" class="list-group form-control"></div>
															<!-- box that contains the error division message -->
															<div id="searchOutput"></div>`;
	//bootstrap the html
	jQuery('#syndicator').html(suggestionBox);
	
	//autocomplete
	jQuery( '#keywords' ).keyup( function ( e ) {
		suggestions.reset();
	} );
	
	//trigger autocomplete if the user fills the input and hits enter.
	jQuery( '#keywords' ).keypress( function ( e ) {
		if ( e.which == 13 ) {
			suggestions.reset();
		}
	} );
	
	//trigger autocomplete if the user clicks on the search button
	jQuery( "#search" ).click( () => {
		suggestions.reset();
	} );
	
} );