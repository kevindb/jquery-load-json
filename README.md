# JQuery loadJSON plugin
This is a JQuery plugin that enables developers to load JSON data from the server and load JSON object into the DOM. No templating language is required - this plugin matches DOM elements in the HTML page with a JSON object using a DOM element properties.

## Usage
To use loadJSON plugin two items should be defined:
  * HTML code that will be used as template
  * JSON object that will be used to populate template

### HTML template
Template is plain HTML code. Only requirement is that elements that should be populated must have id, name, class, or rel attributes that have matching properties in the JSON object. Example of HTML template is shown below:
```
		<div id="data">
			<h1 id="Name"></h1>
			<label for="Address">Address:</label>
			<span id="Address"></span>	
			<label for="Contact">Contact by:</label>
			<span id="Contact"></span>
		</div>
```

In the template h1 tag with id Name, and span tags with ids Address and Contact will be populated with JSON properties.

### JSON object
Once HTML template is defined JSON object that will be used to populate template must be defines. Example of object that can populate template shown above is shown in the following listing:
```
		data = {
					"Name":"Emkay Entertainments",
					"Address":"Nobel House, Regent Centre",
					"Contact":"Phone"
		}  
```
Object has three properties (Name, Address, and Contact) that will be injected into the template.

### Binding JSON object to the template
Once HTML template and JSON object are defined, JSON object can be loaded into the HTML code. This can be achieved using the following line of JavaScript code:
```
		$('div#data').loadJSON(data);
```
As a result 'data' object will be loaded into the HTML fragment with id data. Resulting HTML is shown in the following listing:
```
		<div id="data">
			<h1 id="Name">Emkay Entertainments</h1>
			<label for="Address">Address:</label>
			<span id="Address">Nobel House, Regent Centre</span>	
			<label for="Contact">Contact by:</label>
			<span id="Contact">Phone</span>
		</div>
```

You can find detailed instructions how the plugin can be used in the following pages:
  1. [How to load object into the HTML element](wiki/LoadingHTMLElements) where is explained how the JavaScript objects are loaded in the HTML elements
  1. [Using loadJSON plugin as a template engine](wiki/HTMLTemplate) where is explained how this plugin can be used for generating output based on template
  1. [Working with HTML forms](wiki/WorkingWithFormElements) where is explained how you can load HTML form with JavaScript object

## Examples
You can see few live examples where it is shown how loadJSON plugin can be used:
  1. [Creating list of elements](http://jquery-load-json.googlecode.com/svn/trunk/list.html) - in this example is shown how the array of JSON objects can be bound to the simple HTML template,
  1. [Showing details of the JSON object](http://jquery-load-json.googlecode.com/svn/trunk/details.html?ID=17) - this example shows how details about the single object can be bound to the HTML template,
  1. [Populating form with JSON object](http://jquery-load-json.googlecode.com/svn/trunk/edit.html?ID=17) - this example shows how you can populate form elements from the JSON object,
  1. [Loading complex/hierarchical structure](http://jquery-load-json.googlecode.com/svn/trunk/hierarchy.html) this example show how you can generate complex structures using loadJSON plugin,
  1. [Generate template for array elements](http://jquery-load-json.googlecode.com/svn/trunk/array.html) in this example is shown how you can define custom templates for different elements in the array,
  1. [Adding load events](http://jquery-load-json.googlecode.com/svn/trunk/events.html) in this example is shown how you can define on load events,
  1. [Loading JSON from the external sites](http://jquery-load-json.googlecode.com/svn/trunk/BingMapsSearch.html) - in this example is shown how you can load JSON data that will be loaded from the external sites - in this case from the Bing Maps web service.
  1. [Populating connected drop-downs  using the Ajax calls](http://jquery-load-json.googlecode.com/svn/trunk/categories-ajax.html) - in this example is shown how you can load subcategories drop-downs when parent category drop-down is changed. Drop-down values are taken from the server-side via Ajax calls.
  1. [Populating connected dropdowns using LINQ](http://jquery-load-json.googlecode.com/svn/trunk/linq.html) - in this example is shown how you can load subcategories dropdown when parent category dropdown is changed. Values are stored as a local JavaScript arrays and filtered using the LINQ library.

## Origin

Exported from [code.google.com/p/jquery-load-json](https://code.google.com/p/jquery-load-json/)

## License

This repository is licensed under the GNU General Public License v2.
See [LICENSE](LICENSE.md) for details.
