# EBSCO suggestions App
This repository contains an express application that offers an API and a Web Interface.

## Content

### API
The API is multi engine based and each engine is represented by a driver that facilitates the integration with the endpoint resource.
The API thus masks how the integration with the endpoint resource should happen for better security.

### Web Interface
The interface is a single page application built using simply HTML, CSS and Javascript.
The interface relies on Bootstrap to better display the output.
The interface contains a simple syndicator that loads all the required Javascript and CSS files and automatically updates the content of the page and establishes the link with the suggestion API.
The syndicator requires the presence of an element with id value equal to **syndicator** and requiring its Javascript file.

```html
<div id="syndicator"></div>
<script src='/javascripts/syndicator.js'></script>
```

## Installation
This package can be installed by clonnig it from Git then installing its dependencies.
```bash
> git clone https://github.com/mikehajj/ebsco.git
> cd ebsco
> npm install
```

# Basic Mode
Once you install the application, you can turn it on quickly and start using it by following the below commands.

#### Starting the Application
Running the App can be accomplished via npm.
```bash
> cd ebsco
> export DEBUG='ebsco:server'
> npm start
```

#### Usage via Browser
Once the application is running, open your browser and type: [http://localhost:3000](http://localhost:3000)

# Advanced Mode 
If you wish to play around with the application, you can change the verbosity level and the integration engine.

#### Debug Mode
The application uses [Bunyan](https://www.npmjs.com/package/bunyan#levels) to display verbose logs. 
You can change the level of verbosity by setting an environment variable **EBSCO_SUGGEST_DEBUG_LEVEL** prior to starting the application.
```bash
> cd ebsco
> export EBSCO_SUGGEST_DEBUG_LEVEL='debug'
> export DEBUG='ebsco:server'
> npm start
```

#### Changing the Engine
The application is multi engine but currently supports only 1 driver **Google**.
You can change the engine by following 2 steps:
1. **Driver:**
    First create a driver that connects to a new engine and place it in **/lib/engine/drivers/your_engine.js**.
    Your driver should be represented by a JavaScript class with a public method named **autocomplete**.
    *Ex:*
    ```js
    // JavaScript Class
    const myDriver = { 
        ... 
        /**
	     * Driver Autocomplete Method, execute remote API call and return a JSON response
	     * @param req {Object}
	     * @param cb {Function}
	     */
        autocomplete( req, cb ) => { ... }
        ...
    };
    module.exports = myDriver;
    ```

2. **Environment Variable:**
    Next, on the command line and before you start the application, set the environment variable **EBSCO_SUGGEST_ENGINE**.
    The value of this environment variable should be the name of the driver file without the file extension.
    ```bash
    > cd ebsco
    > export EBSCO_SUGGEST_ENGINE='your_engine'
    > export DEBUG='ebsco:server'
    > npm start
    ```
   
#### Changing the default Values
You can modify the default values that the applications uses such as the **PORT** of the application and the input names and the **URI** that the frontend uses to communicate with the **API**.
   
##### Example: 
1. **Express Applicaiton:**
      ```bash
      > cd ebsco
      > export DEBUG='ebsco:server'
      > export PORT=4000
      > npm start
      ```
    
2. **Frontnend Widget:**
      ```html
      <div id="syndicator"></div>
      <script>
    	window.suggestionsOptions = {
    		container: 'syndicator', //name of the container where the widget populates
    		inputName: 'sugg_keywords', //name of the keywords input 
    		searchName: 'sugg_search', //name of the search button
    		searchLabel: 'Search', //search button label
    		suggestionListName: 'suggestions', //name of the list that will show the suggestions
    		searchBoxName: 'searchOutput', //name of the division that will display the error message if any
    		API: {
    			method: "POST", //the method that the API uses
    			uri: "http://localhost:4000/autocomplete" //the API URI value
    		}
    	};
      </script>
      <script src='/javascripts/syndicator.js'></script>
      ```