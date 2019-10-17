# EBSCO suggestions App
---
This repository contains an express application that offers an API and a Web Interface.

## Content
---
### API
The API is multi engine based and each engine is represented by a driver that facilitates the integration with the endpoint resource.
The API thus masks how the integration with the endpoint resource should happen for better security.

### Web Interface
The interface is a single page application built using simply HTML, CSS and Javascript.
The interface relies on Bootstrap to better display the output.
The interface contains a simple syndicator that loads all the required Javascript and CSS files and automatically updates the content of the page and establishes the link with the suggestion API.


## Installation
---
This package can be installed by clonnig it from Git then installing its dependencies.
```
> git clone https://github.com/mikehajj/ebsco.git
> cd ebsco
> npm install
```

## Running
---
Running the App can be accomplished via npm.
```
> cd ebsco
> npm start
```

## Usage
---
Once the application is running, open your browser and type: [http://localhost:3000](http://localhost:3000)