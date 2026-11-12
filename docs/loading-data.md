# Loading data

To use loadJSON you need two things: a **template**, which is ordinary HTML, and the **data** to
load into it.

## Template

A template is plain markup. The elements that should take a value need a class, id or name equal to
a key of the data:

```html
<div id="company">
  <h1 id="Name"></h1>
  <label for="Address">Address:</label>
  <span id="Address"></span>
  <label for="Contact">Contact by:</label>
  <span id="Contact"></span>
</div>
```

## Data

The data is a JavaScript object (or an array, or a single value). Each key names the elements that
take its value:

```js
var data = {
  Name: "Emkay Entertainments",
  Address: "Nobel House, Regent Centre",
  Contact: "Phone",
};
```

## Loading

Call `loadJSON` on the template with the data:

```js
$("#company").loadJSON(data);
```

The result:

```html
<div id="company">
  <h1 id="Name">Emkay Entertainments</h1>
  <label for="Address">Address:</label>
  <span id="Address">Nobel House, Regent Centre</span>
  <label for="Contact">Contact by:</label>
  <span id="Contact">Phone</span>
</div>
```

`loadJSON` returns the same jQuery object, so calls can be chained. When the jQuery set holds
several elements, each one is loaded with the same data.

## How keys find elements

For each key, loadJSON looks inside the **scope** (the template, for top-level keys) for its
**match**, trying in order:

1. elements with the key as a class (`class="Name"`);
2. otherwise, elements with the key as their id (`id="Name"`);
3. otherwise, elements with the key as their name (`name="Name"`), including names with brackets
   such as `name="tags[]"`.

The first step that finds anything wins, and every element it finds takes the value. So
`class="Price"` on three elements loads the price into all three.

- A key that matches nothing is skipped, as is an empty key.
- A `null` or `undefined` value leaves its elements unchanged.
- Keys that are not valid CSS selectors (with spaces, colons or quotes, for example) are compared
  with each element's class, id or name directly.
- A key containing a dot, such as `"a.b"`, is read as the selector `.a.b` (class `a` and class
  `b`), not as a class named `a.b`. Avoid dots in keys you match by class.

If no class, id or name matches, elements anywhere in the page whose `rel` attribute is the key are
loaded. This is deprecated and removed in 2.0; see [Debugging and deprecations](debugging.md).

## Nested objects

When a value is an object, its keys are looked up inside the match of the enclosing key, which
becomes their scope:

```html
<div id="order">
  <div class="customer">
    <span class="name"></span>
  </div>
  <div class="supplier">
    <span class="name"></span>
  </div>
</div>
```

```js
$("#order").loadJSON({
  customer: { name: "Asadul Ltd" },
  supplier: { name: "The Empire" },
});
```

Each `name` is found only inside its own `customer` or `supplier` element.

## How elements take a value

What a match does with its value depends on its **element kind**:

| Element kind                       | Takes the value as                                    | Details                 |
| ---------------------------------- | ----------------------------------------------------- | ----------------------- |
| Content (`div`, `span`, `p`, ...)  | its contents, inserted as HTML                        | [Elements](elements.md) |
| Link (`a`)                         | its `href`, or a query parameter added to the `href`  | [Elements](elements.md) |
| Image (`img`)                      | its `src`, or `src`, `alt` and `title` from an object | [Elements](elements.md) |
| Field (text, number, hidden, ...)  | its value                                             | [Forms](forms.md)       |
| Checkbox, radio                    | checked when its value equals the value               | [Forms](forms.md)       |
| Select, option                     | the selected value, or new options from an array      | [Forms](forms.md)       |
| Any element given an array of data | one copy of the element per item                      | [Arrays](arrays.md)     |

## What you can pass

`loadJSON(data, options)` accepts:

- **An object or an array**: loaded as described above.
- **A single value** (a string, number or boolean): set on the template element itself, or on each
  control when the template is a form.
- **A JSON string** that starts with `{` or `[`: parsed with `JSON.parse`, then loaded. Invalid JSON
  throws.
- **Any other string** is requested as a URL and the JSON response is loaded. This is deprecated and
  removed in 2.0. Request the data yourself and pass it in:

  ```js
  $.getJSON("company.json").done(function (data) {
    $("#company").loadJSON(data);
  });
  ```

Calling `loadJSON()` with nothing or with `null` throws a `TypeError`.

## Options

| Option      | Default    | Description                             |
| ----------- | ---------- | --------------------------------------- |
| `onLoading` | do nothing | Called before each element is loaded.   |
| `onLoaded`  | do nothing | Called after each element is loaded.    |
| `mobile`    | `false`    | Ignored. Deprecated and removed in 2.0. |

The callbacks run once per element in the jQuery set, with no arguments:

```js
$("#company").loadJSON(data, {
  onLoading: function () {
    $("#company").hide();
  },
  onLoaded: function () {
    $("#company").fadeIn();
  },
});
```

## Loading the same template again

loadJSON does not reset a template between calls: a second call loads into the output of the first,
including any copies a [repeat](arrays.md) added. To start each call from the original markup, set
the element's `loadJSON-template` data to an empty string before the first call:

```js
$("#list").data("loadJSON-template", "");
$("#list").loadJSON(firstPage); // saves the original markup, then loads
$("#list").loadJSON(secondPage); // restores the original markup, then loads
```

Restoring the saved markup replaces the template's content, so event handlers bound inside it after
the first call are lost. Bind them on the template element itself (delegated events) instead.

## Untrusted data

Values loaded into content elements, `<button>` included, are inserted as HTML. Escape
data from users or other untrusted sources before loading it, or the markup in it will run in the
page. With [`$.fn.loadJSON.debug`](debugging.md) on, loadJSON warns when a value looks like markup.
