# Debugging and deprecations

Version 2.0 removes some behavior that 1.x keeps for compatibility. Version 1.4 can tell you which of
it your page uses.

## Turning on debugging

Set `$.fn.loadJSON.debug` to `true` before loading:

```js
$.fn.loadJSON.debug = true;
$("#company").loadJSON(data);
```

With debugging on, loadJSON writes a **deprecation notice** to the console (`console.warn`) the
first time a page runs each behavior that 2.0 removes or changes. Each notice is shown once per page,
however often the behavior runs. Debugging is off by default, and turning it on changes nothing but
the console output.

Turn it on while developing or testing, load your pages as users would, and work through the notices
before upgrading to 2.0.

## Notices

Every notice starts with `jQuery loadJSON:`.

### `Array.prototype.contains`

> Array.prototype.contains is deprecated and will be removed in 2.0. Use Array.prototype.indexOf
> instead.

Every call to `loadJSON` defines `Array.prototype.contains` on all arrays in the page, as earlier
versions did. Since 1.4 it is not enumerable, so it no longer shows up in `for...in` loops. 2.0 stops
defining it. If your own code calls `.contains()` on arrays, use `indexOf` (or `includes`) instead.

This notice appears on the first call with debugging on, whether or not your code uses `contains`.

### jQuery Mobile refresh

> Refreshing jQuery Mobile selectmenu and checkboxradio widgets is deprecated and will be removed in
> 2.0. Refresh them in onLoaded instead.

After setting a select, checkbox or radio button, loadJSON refreshes its jQuery Mobile widget when
the element has one. With jQuery 4 this never happens. 2.0 removes the refresh. Refresh the widgets
yourself:

```js
$("#form").loadJSON(data, {
  onLoaded: function () {
    $("#form select").selectmenu("refresh");
    $("#form :checkbox, #form :radio").checkboxradio("refresh");
  },
});
```

### The `mobile` option

> The mobile option has no effect and will be removed in 2.0.

The `mobile` option has never been read. Remove it from your options.

### The `"src$alt"` image format

> An image value is used as the whole src: the "src$alt" format is not supported. Pass {src, alt}
> instead.

Shown when a string loaded into an image contains `$`. The whole string becomes the image's `src`.
To set the `alt` text, load an object:

```js
$("#company").loadJSON({ Logo: { src: "images/logo.jpg", alt: "Our logo" } });
```

### Images from the top-level `src`, `alt` and `title`

> Setting images from the top-level src, alt and title is deprecated and will be removed in 2.0. Give
> each image its own value.

Shown when an image's own value is neither a string nor an object, and the top-level data has a
`src`, `alt` or `title`, which the image then takes. Load a string or an object into each image
instead (see [Images](elements.md#images)).

### Matching by `rel`

> Matching keys by the rel attribute is deprecated and will be removed in 2.0. Use a class, id or
> name.

Shown when a key matches no class, id or name and is matched by a `rel` attribute instead. This
match searches the whole page, not only the loaded element. Give the element a class equal to the
key:

```html
<!-- Before -->
<span rel="Name"></span>
<!-- After -->
<span class="Name"></span>
```

### Array items in `rel` index children

> Loading array items into rel="index" children is deprecated and will be removed in 2.0.

Shown when an array is loaded into an element whose children have `rel` attributes, each child
taking the item at its `rel` index. Write one element per item instead, without `rel`: a
[repeat](arrays.md#how-a-repeat-works) fills existing elements in order before adding copies.

### URL arguments

> Passing a URL to loadJSON is deprecated and will be removed in 2.0. Load the data with $.getJSON
> and pass it to loadJSON.

Shown when `loadJSON` is given a string that is not JSON, which it requests as a URL. Request the
data yourself; this also lets you handle errors, which the built-in request ignores:

```js
// Before
$("#company").loadJSON("company.json");

// After
$.getJSON("company.json")
  .done(function (data) {
    $("#company").loadJSON(data);
  })
  .fail(function () {
    $("#company").text("The company could not be loaded.");
  });
```

The built-in request is never cached; pass `cache: false` to `$.ajax` if you depend on that.

### Values inserted as HTML

> Values are inserted as HTML. From 2.0 they are inserted as text unless the html option is true.

Shown when a string that looks like markup (it contains `<` followed by a letter, `/`, `!` or `?`)
is loaded into a content element. In 1.x the markup is parsed and added to the page. In 2.0 it is
shown as text, and an `html: true` option keeps the 1.x behavior. If the value comes from users or
another untrusted source, escape it now: inserting it as HTML lets markup in it run in your page.
