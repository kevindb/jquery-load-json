#jQuery loadJSON plugin
This is a jQuery plugin that enables developers to load JSON data from the server and load JSON object into the DOM. No templating language is required - this plugin matches DOM elements in the HTML page with a JSON object using a DOM element properties.

##Community
Want to contribute to jQuery loadJSON? Awesome! See [CONTRIBUTING](CONTRIBUTING.md) for more information.

###Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md) to ensure that this project is a welcoming place for **everyone** to contribute to. By participating in this project you agree to abide by its terms.

##Requirements
Requires jQuery 1.7+.

##Download
* **Development:** [src/jquery.loadJSON.js](https://github.com/kevindb/jquery-load-json/blob/master/src/jquery.loadJSON.js)
* **Production/Minified:** [dist/jquery.loadJSON.min.js](https://github.com/kevindb/jquery-load-json/blob/master/dist/jquery.form.min.js)

###CDN
```html
<script src="https://cdn.rawgit.com/kevindb/jquery-load-json/v1.3.3/dist/jquery.loadJSON.min.js" integrity="sha384-fG4z44FEBJnIevyzvSDobSmVTsO/oVsxNvKcUl7bO1ihWYDPg2QI83Xi+7wSBzap" crossorigin="anonymous"></script>
```

##Usage
To use loadJSON plugin two items should be defined:
  * HTML code that will be used as template
  * JSON object that will be used to populate template

###HTML template
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

###JSON object
Once HTML template is defined JSON object that will be used to populate template must be defines. Example of object that can populate template shown above is shown in the following listing:
```
		data = {
					"Name":"Emkay Entertainments",
					"Address":"Nobel House, Regent Centre",
					"Contact":"Phone"
		}  
```
Object has three properties (Name, Address, and Contact) that will be injected into the template.

###Binding JSON object to the template
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

##Examples
You can see few live examples where it is shown how loadJSON plugin can be used:
  1. [Creating list of elements](examples/list.html) - in this example is shown how the array of JSON objects can be bound to the simple HTML template,
  1. [Showing details of the JSON object](examples/details.html?ID=17) - this example shows how details about the single object can be bound to the HTML template,
  1. [Populating form with JSON object](examples/edit.html?ID=17) - this example shows how you can populate form elements from the JSON object,
  1. [Loading complex/hierarchical structure](examples/hierarchy.html) this example show how you can generate complex structures using loadJSON plugin,
  1. [Generate template for array elements](examples/array.html) in this example is shown how you can define custom templates for different elements in the array,
  1. [Adding load events](examples/events.html) in this example is shown how you can define on load events,
  1. [Loading JSON from the external sites](examples/BingMapsSearch.html) - in this example is shown how you can load JSON data that will be loaded from the external sites - in this case from the Bing Maps web service.
  1. [Populating connected drop-downs  using the Ajax calls](examples/categories-ajax.html) - in this example is shown how you can load subcategories drop-downs when parent category drop-down is changed. Drop-down values are taken from the server-side via Ajax calls.
  1. [Populating connected dropdowns using LINQ](examples/linq.html) - in this example is shown how you can load subcategories dropdown when parent category dropdown is changed. Values are stored as a local JavaScript arrays and filtered using the LINQ library.

##Contributors
This project has had several previous homes.
See [CONTRIBUTORS](CONTRIBUTORS.md) for details.

##License

This repository is licensed under the GNU Lesser General Public License v2.1.  
See [LICENSE](LICENSE.md) for details.
