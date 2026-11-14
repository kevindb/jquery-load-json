# jQuery loadJSON

A jQuery plugin that fills HTML markup you already have, forms included, with values from a JSON
object. There is no template language: the plugin matches each key of the data to the elements
whose class, id or name is that key, and sets each value in the way that suits the element. Text
goes into content elements, form controls get their value or checked state, links and images get
their `href` and `src`, and arrays repeat an element once per item.

Works with jQuery 3.5 and later, jQuery 4 included. Install jQuery alongside it.

## Install

With npm:

```sh
npm install jquery-load-json
```

```js
import $ from "jquery";
import "jquery-load-json";
```

The package also has a classic build for script tags, AMD and CommonJS
(`dist/jquery.loadJSON.js`), and a minified one (`dist/jquery.loadJSON.min.js`).

From a CDN, after jQuery:

```html
<script src="https://cdn.jsdelivr.net/npm/jquery-load-json@1.4.0/dist/jquery.loadJSON.min.js" integrity="sha384-wWn1sQhXqh8ywbVmTb/0kOItwvgWfzQP037QrrIQwKWRKzGWEWu6C62FbTuslrf1" crossorigin="anonymous"></script>
```

or

```html
<script src="https://unpkg.com/jquery-load-json@1.4.0/dist/jquery.loadJSON.min.js" integrity="sha384-wWn1sQhXqh8ywbVmTb/0kOItwvgWfzQP037QrrIQwKWRKzGWEWu6C62FbTuslrf1" crossorigin="anonymous"></script>
```

## Example

```html
<div id="company">
  <h1 class="Name"></h1>
  <p class="Address"></p>
  <a class="Website">Website</a>
</div>
```

```js
$("#company").loadJSON({
  Name: "Emkay Entertainments",
  Address: "Nobel House, Regent Centre",
  Website: "https://example.com",
});
```

```html
<div id="company">
  <h1 class="Name">Emkay Entertainments</h1>
  <p class="Address">Nobel House, Regent Centre</p>
  <a class="Website" href="https://example.com">Website</a>
</div>
```

Values are inserted as HTML in 1.x. Escape data from untrusted sources before loading it.

## Documentation

- [Loading data](docs/loading-data.md): templates, keys, matching, nested objects, arguments and
  callbacks
- [Elements](docs/elements.md): text, links and images
- [Forms](docs/forms.md): inputs, checkboxes, radio buttons, textareas and selects
- [Arrays and repeats](docs/arrays.md): lists from arrays of objects
- [Debugging and deprecations](docs/debugging.md): `$.fn.loadJSON.debug` and what 2.0 removes
- [Migrating from 1.x to 2.0](docs/migrating-to-2.md): every change in 2.0 and what to do about it
- [Live examples](https://kevindb.github.io/jquery-load-json/examples/)

## Community

Want to contribute? See [CONTRIBUTING](CONTRIBUTING.md). Security issues: see
[SECURITY](SECURITY.md).

This project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating
in it you agree to abide by its terms.

## Credits

jQuery loadJSON was created by Jovan Popovic, building on Alexandre Caprais's notemplate plugin.
Thank you, Jovan. Jovan's newer [jquery-view-engine](https://github.com/JocaPC/jquery-view-engine)
takes the same idea further. See [CONTRIBUTORS](CONTRIBUTORS.md) for the project's history.

## License

GNU Lesser General Public License v2.1 or later. See [LICENSE](LICENSE.md).
