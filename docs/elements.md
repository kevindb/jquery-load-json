# Elements

How content elements, links and images take a value. For form controls, see [Forms](forms.md).

## Content

Any element that is not a form control, link or image (`span`, `p`, `div`, `li`, `h1`, `td`,
`button` and so on) takes the value as its contents:

```html
<h1 id="Title"></h1>
<span id="Address"></span>
<p id="Description"></p>
```

```js
$("body").loadJSON({
  Title: "This is a title",
  Address: "Regent Street",
  Description: "Lorem ipsum dolor sit amet",
});
```

```html
<h1 id="Title">This is a title</h1>
<span id="Address">Regent Street</span>
<p id="Description">Lorem ipsum dolor sit amet</p>
```

Numbers and booleans are converted to strings. The value replaces the element's contents and is
inserted as HTML, so a value of `"<b>New</b>"` shows a bold "New". Escape untrusted values before
loading them. In 2.0, values are inserted as text unless the `html` option is `true`.

## Links

A link with no `href` (or an empty one) takes the value as its address:

```html
<a id="Link">Google</a>
```

```js
$("body").loadJSON({ Link: "https://www.google.com" });
```

```html
<a id="Link" href="https://www.google.com">Google</a>
```

The link text is not changed. To load the text as well, put an element for it inside the link:

```html
<a id="Link"><span id="LinkText"></span></a>
```

```js
$("body").loadJSON({ Link: "https://www.google.com", LinkText: "Google" });
```

A link that already has an `href` keeps it and gains a query parameter named after the key. The
parameter goes before any `#fragment`, after `?` or after `&` when there is already a query:

```html
<a class="ID" href="details.html">Details</a>
<a class="ID" href="details.html?view=full#top">Details</a>
```

```js
$("body").loadJSON({ ID: 17 });
```

```html
<a class="ID" href="details.html?ID=17">Details</a>
<a class="ID" href="details.html?view=full&ID=17#top">Details</a>
```

The value is added as is, without URL encoding. Encode values that may contain `&`, `#`, spaces or
other reserved characters with `encodeURIComponent` before loading them.

## Images

An image takes a string value as its `src`:

```html
<img class="Logo" src="" alt="" />
```

```js
$("body").loadJSON({ Logo: "images/logo.jpg" });
```

An object value sets the image's `src`, `alt` and `title`:

```js
$("body").loadJSON({
  Logo: { src: "images/logo.jpg", alt: "Emkay Entertainments", title: "Our logo" },
});
```

Earlier versions documented a `"src$alt"` string format (`"images/logo.jpg$Our logo"`). It was never
applied as described: the whole string becomes the `src`. Use an object to set the `alt`.

When an image's own value is neither a string nor an object (a number, for example), the image takes
the `src`, `alt` and `title` keys at the top level of the data instead. This is deprecated and
removed in 2.0: give each image its own string or object value.
