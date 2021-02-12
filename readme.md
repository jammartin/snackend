# snackend

**s**ocial **n**etwork b**ackend** is a lean module, which provides a configurable and customizable RESTful API for your MVC architectured web-application using MongoDB as database.  
It builds on [mongoose](https://www.npmjs.com/package/mongoose) and [koa](https://www.npmjs.com/package/koa).

**This module is under construction and is NOT ready to be used in a production environment!**

## Installation
As this module should only be used for testing and goofing around, it is not yet published in the npm registry.
Although it can be build from the source as following
```
git clone https://github.com/jammartin/snackend.git
npm install
npm pack
```
To install it afterwards just use npm again
```
npm install --save <path to your snackend folder>/snackend-0.0.0.tgz
```

## Creating a basic controller

```javascript
const Snackend = require('snackend')();
const FileHandlingSchema = require('snackend').FileHandlingSchema;
const File = require('snackend').File;

const app = new Snackend();

app.addController('snack'
	, new FileHandlingSchema({
	  name: String,
	  picture: File
	})).useEndpointTemplate('create')
	   .useEndpointTemplate('retrieveOneBy', 'name')
	   .useEndpointTemplate('downloadOneFileBy', 'id');

app.serve();
```

## Examples 
Example projects using *snackend* can be found [here](https://https://github.com/jammartin/snackend-examples).
