# Arrays and repeats

loadJSON can generate a list from an array of objects, using an element of the page as the item to
copy. See it in the [list example](https://kevindb.github.io/jquery-load-json/examples/list.html).

## Template

Write the markup for one item, with elements whose class, id or name are the keys of each object:

```html
<ul>
  <li>
    <a class="ID" href="details.html"><span class="Name"></span></a>
    <span class="Address"></span>
  </li>
</ul>
```

Prefer classes inside items: every copy repeats the same markup, and an id must be unique in a page.

## Data

```js
var companies = [
  { ID: 17, Name: "Emkay Entertainments", Address: "Nobel House, Regent Centre" },
  { ID: 18, Name: "The Empire", Address: "Milton Keynes Leisure Plaza" },
  { ID: 19, Name: "Asadul Ltd", Address: "Hophouse" },
];
```

## Repeating an element

Load the array into the item:

```js
$("ul li").loadJSON(companies);
```

The `li` is filled with the first object, and a copy of it is added for each of the others:

```html
<ul>
  <li>
    <a class="ID" href="details.html?ID=17"><span class="Name">Emkay Entertainments</span></a>
    <span class="Address">Nobel House, Regent Centre</span>
  </li>
  <li>
    <a class="ID" href="details.html?ID=18"><span class="Name">The Empire</span></a>
    <span class="Address">Milton Keynes Leisure Plaza</span>
  </li>
  <li>
    <a class="ID" href="details.html?ID=19"><span class="Name">Asadul Ltd</span></a>
    <span class="Address">Hophouse</span>
  </li>
</ul>
```

The link already has an `href`, so each one gains its item's `ID` as a query parameter (see
[Links](elements.md#links)).

## Repeating by key

An array can also be the value of a key. Its match is repeated in the same way:

```html
<div id="company">
  <h2 class="Name"></h2>
  <ul>
    <li class="Phones"></li>
  </ul>
</div>
```

```js
$("#company").loadJSON({ Name: "The Empire", Phones: ["0123 456", "0123 789"] });
```

Each item can be a single value, as here, or an object whose keys are matched inside its copy.
Arrays can be nested: an item's key can hold another array, which repeats inside the item's copy.
See the [hierarchy example](https://kevindb.github.io/jquery-load-json/examples/hierarchy.html).

## How a repeat works

- When the match of a key has several elements, they are filled in order: the first with the first
  item, the second with the second, and so on.
- For each remaining item, a copy of the last matched element is added after it. The copy is taken
  before loading, so it carries the original markup, and event handlers bound to it (and inside it)
  are copied too.
- When the array is shorter than the match, the extra elements are left unchanged. An empty array
  changes nothing.

Writing several items for a key lets each have its own markup. The first two items below get their
own layout, and the rest repeat the last one:

```html
<div id="directory">
  <ul>
    <li class="Companies"><strong class="Name"></strong></li>
    <li class="Companies"><em class="Name"></em></li>
    <li class="Companies"><span class="Name"></span></li>
  </ul>
</div>
```

```js
$("#directory").loadJSON({ Companies: companies });
```

This works through a key only. Loading the array straight into a jQuery set of several elements,
such as `$("#directory li").loadJSON(companies)`, loads the whole array into each element, so each
one is repeated on its own.

See the [array example](https://kevindb.github.io/jquery-load-json/examples/array.html).

## Arrays that are not repeated

- A select takes an array as a list of options to add, or of values to select (see
  [Selects](forms.md#selects)).
- A group of checkboxes takes an array as the values to check (see [Checkboxes](forms.md#checkboxes)).
- An element with children that have a `rel` attribute loads the item at each child's `rel` index
  into that child (`rel="0"` takes the first item). This is deprecated and removed in 2.0; see
  [Debugging and deprecations](debugging.md).

## Loading again

Copies added by a repeat stay in the page, and a second call finds them. Through a key, they are
filled in order before more copies are added. Loaded directly, as with `$("ul li")`, the set now
holds every copy, and each one is repeated again. To load a new array, start each call from the
original markup as described in [Loading the same template again](loading-data.md#loading-the-same-template-again).
