# Migrating from 1.x to 2.0

Version 2.0 removes behavior that 1.x kept for compatibility, inserts values as text instead of HTML,
and fixes three bugs whose fixes change output. This page lists every change and what to do about
it.

Start on 1.4 with debugging on: it warns about most of these changes before you upgrade.

```js
$.fn.loadJSON.debug = true;
```

With debugging on, 1.4 writes a deprecation notice to the console (`console.warn`) the first time a
page runs each behavior that 2.0 removes or changes. Load your pages as users would and work through
the notices. Each section below quotes the notice that announces it. Every notice starts with
`jQuery loadJSON:`. The 1.x documentation is on the
[`v1.4.0` tag](https://github.com/kevindb/jquery-load-json/tree/v1.4.0/docs).

## Requirements

### jQuery 3.5 or later

2.0 works with jQuery 3.5 and later, jQuery 4 included. 1.x supports jQuery 1.7 and later; stay on
1.x if you need an older jQuery.

With npm, `jquery` is now a peer dependency (`>=3.5`) instead of a dependency, so the package uses
the jQuery your project installs instead of bringing its own. npm 7 and later install it for you
when it is missing. With Composer, `components/jquery` must be 3.5 or later.

### Package entry points

`package.json` now has an `exports` map. In Node and in bundlers that read it, you can import:

- the package name, `jquery-load-json`: `import` gets the module build
  (`dist/jquery.loadJSON.mjs`), `require` gets the classic build (`dist/jquery.loadJSON.js`), as
  before;
- the built files by path: `jquery-load-json/dist/jquery.loadJSON.js`,
  `jquery-load-json/dist/jquery.loadJSON.mjs` and `jquery-load-json/dist/jquery.loadJSON.min.js`;
- `jquery-load-json/package.json`.

Any other path no longer resolves (`ERR_PACKAGE_PATH_NOT_EXPORTED`). In particular,
`jquery-load-json/src/jquery.loadJSON.js` and the other files in `src/` can no longer be imported;
import the package name instead. The CDN URLs are unchanged.

### Bower

2.0 has no `bower.json`. Install from npm or a CDN instead.

## Removed

### `Array.prototype.contains`

> Array.prototype.contains is deprecated and will be removed in 2.0. Use Array.prototype.indexOf
> instead.

1.x defined `Array.prototype.contains` on every call. 2.0 does not touch `Array.prototype`. If your
own code calls `.contains()` on arrays, use `includes` (or `indexOf`) instead:

```js
// Before
if (tags.contains("new")) {
}

// After
if (tags.includes("new")) {
}
```

1.4 shows this notice on the first call with debugging on, whether or not your code uses
`contains`.

### jQuery Mobile refresh

> Refreshing jQuery Mobile selectmenu and checkboxradio widgets is deprecated and will be removed in
> 2.0. Refresh them in onLoaded instead.

1.x refreshed the jQuery Mobile widget of a select, checkbox or radio button after setting it (never
with jQuery 4). 2.0 does not. Refresh the widgets yourself:

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

The `mobile` option was never read. Remove it from your options; 2.0 ignores it like any other
unknown option.

### The `"src$alt"` image format

> An image value is used as the whole src: the "src$alt" format is not supported. Pass {src, alt}
> instead.

Earlier versions documented a `"src$alt"` string format for images that was never applied: the whole
string becomes the `src`, in 1.4 and in 2.0. 2.0 no longer warns about it. To set the `alt` text,
load an object:

```js
$("#company").loadJSON({ Logo: { src: "images/logo.jpg", alt: "Our logo" } });
```

### Images from the top-level `src`, `alt` and `title`

> Setting images from the top-level src, alt and title is deprecated and will be removed in 2.0. Give
> each image its own value.

In 1.x, an image whose own value was neither a string nor an object (a number, for example) took
the `src`, `alt` and `title` keys at the top level of the data. In 2.0 an image takes only its own
value: an object sets `src`, `alt` and `title`, and any other value becomes the `src`.

```js
// Before: the image matched by Logo took the top-level src and alt
$("#company").loadJSON({ Logo: 1, src: "images/logo.jpg", alt: "Our logo" });

// After
$("#company").loadJSON({ Logo: { src: "images/logo.jpg", alt: "Our logo" } });
```

### Matching keys by `rel`

> Matching keys by the rel attribute is deprecated and will be removed in 2.0. Use a class, id or
> name.

In 1.x, a key that matched no class, id or name was matched by a `rel` attribute, anywhere in the
page rather than only inside the loaded element. 2.0 matches by class, id and name only, inside the
loaded element. Give the element a class equal to the key:

```html
<!-- Before -->
<span rel="Name"></span>
<!-- After -->
<span class="Name"></span>
```

### Array items in `rel` index children

> Loading array items into rel="index" children is deprecated and will be removed in 2.0.

In 1.x, an array loaded into an element whose children had `rel` attributes put the item at each
child's `rel` index into that child. In 2.0 that element is repeated like any other: it is filled
with the first item and copied for each further item. Write one element per item, without `rel`. A
[repeat](arrays.md#how-a-repeat-works) fills existing elements in order before adding copies:

```html
<!-- Before -->
<ul class="Steps">
  <li rel="0"></li>
  <li rel="1"></li>
</ul>
<!-- After -->
<ul>
  <li class="Steps"></li>
  <li class="Steps"></li>
</ul>
```

### URL arguments

> Passing a URL to loadJSON is deprecated and will be removed in 2.0. Load the data with $.getJSON
> and pass it to loadJSON.

1.x requested any string argument that did not start with `{` or `[` as a URL. 2.0 parses every
string argument as JSON, so a URL now throws a `SyntaxError` and nothing is requested. (A JSON
string with leading whitespace, which 1.x requested as a URL, is now parsed.) Request the data
yourself; this also lets you handle errors, which the built-in request ignored:

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

The built-in request was never cached; pass `cache: false` to `$.ajax` if you depend on that.

### `$.fn.loadJSON.debug`

2.0 has no deprecation notices, so `$.fn.loadJSON.debug` is gone. Setting it does nothing; you can
remove it.

## Changed

### Values are inserted as text

> Values are inserted as HTML. From 2.0 they are inserted as text unless the html option is true.

1.x inserted values into content elements (`span`, `p`, `div`, `button` and so on) as HTML, so a
value of `"<b>New</b>"` showed a bold "New", and markup in data from users could run in the page.
2.0 inserts values as text: `"<b>New</b>"` shows the characters `<b>New</b>`. To keep inserting
HTML, for data you trust, pass the `html` option:

```js
$("#article").loadJSON(article, { html: true });
```

1.4 shows this notice only for a string that looks like markup (it contains `<` followed by a
letter, `/`, `!` or `?`). Values without markup look the same either way. Entities do not: in 2.0
`"&amp;"` shows as `&amp;`, not `&`.

## Fixed

These fixes change output that 1.x produced.

### The template is saved on the first call

1.x was meant to restore a template's original markup on each call, but never saved it unless you
set the element's `loadJSON-template` data to `null` or `""` first. So a second call loaded into the
output of the first, including the copies a repeat had added. 2.0 saves the markup on the first call
and restores it on each later call, so every call starts from the original markup:

```js
$("#list").loadJSON({ Items: ["a", "b"] }); // two items
$("#list").loadJSON({ Items: ["c"] }); // 2.0: one item, "c"; 1.x: "c", then the old "b"
```

Restoring the markup replaces the element's content, so event handlers bound inside it since the
first call are lost. Bind them on the loaded element itself, as delegated events:

```js
$("#list").on("click", ".Items", function () {
  // ...
});
```

Setting `loadJSON-template` still works: markup in it replaces the content before each call.

### Link parameters are URL-encoded

When a link already has an `href`, loadJSON adds the key and value as a query parameter. 1.x added
them as they were; 2.0 encodes both with `encodeURIComponent`:

```js
$("body").loadJSON({ q: "a b&c" });
// 1.x: href="search?q=a b&c"
// 2.0: href="search?q=a%20b%26c"
```

If you encoded values before loading them, stop, or they are encoded twice. A link without an
`href` still takes the value as its whole address, unchanged.

### Keys match literally

1.x built each key into a selector as it was, so a key with a dot such as `"a.b"` matched elements
with both class `a` and class `b`, and a key such as `"a,b"` or `"div .a"` worked as a selector. 2.0
escapes every key, so it matches only the class, id or name that is exactly the key: `"a.b"`
matches `class="a.b"`. Keys that are plain words match as before.
