# Forms

loadJSON fills a form from an object whose keys are the controls' names. Each control takes the value
in the way that suits its kind. See it in the
[form example](https://kevindb.github.io/jquery-load-json/examples/edit.html?ID=17).

## Template

```html
<form id="company" action="details.html" method="get">
  <input type="hidden" name="ID" />

  <label for="Name">Name</label>
  <input id="Name" name="Name" type="text" />

  <label for="Address">Address</label>
  <textarea id="Address" name="Address" rows="5" cols="20"></textarea>

  <label for="Country">Country</label>
  <select id="Country" name="Country" multiple>
    <option value="UK">United Kingdom</option>
    <option value="SRB">Serbia</option>
    <option value="USA">United States of America</option>
    <option value="FRA">France</option>
  </select>

  <label for="IsFeatured">Is featured</label>
  <input id="IsFeatured" name="IsFeatured" type="checkbox" value="1" />

  <label for="Town">Town</label>
  <select id="Town" name="Town">
    <option value="">-</option>
    <option value="London">London</option>
    <option value="Liverpool">Liverpool</option>
    <option value="Lothian">Lothian</option>
  </select>

  <fieldset>
    <legend>Contact</legend>
    <label><input name="Contact" type="radio" value="Email" /> Email</label>
    <label><input name="Contact" type="radio" value="Phone" /> Phone</label>
    <label><input name="Contact" type="radio" value="Post" /> Post</label>
  </fieldset>

  <button type="submit">Save</button>
</form>
```

## Data

```js
$("#company").loadJSON({
  ID: 17,
  Name: "Emkay Entertainments",
  Address: "Nobel House, Regent Centre",
  Country: ["UK", "FRA"],
  IsFeatured: true,
  Town: "Lothian",
  Contact: "Phone",
});
```

Keys are matched by class, then id, then name (see [Loading data](loading-data.md#how-keys-find-elements)).
In this form the labelled controls have an id equal to their name, so either one finds them.

## Fields

Text-like inputs take the value directly: `text`, `hidden`, `password`, `email`, `url`, `tel`,
`search`, `number`, `range`, `color`, `date`, `datetime-local`, `month`, `week` and `time`.

Submit, reset, button, image and file inputs are left unchanged.

## Textareas

A textarea takes the value as its text. Markup in the value shows as text and is not parsed.

## Checkboxes

A checkbox is checked when its `value` equals the loaded value, and unchecked otherwise. The
comparison is loose, so the number `1` checks `value="1"`.

- An array checks every box in the group whose value is in the array:

  ```html
  <input type="checkbox" name="Tags" value="new" />
  <input type="checkbox" name="Tags" value="sale" />
  <input type="checkbox" name="Tags" value="featured" />
  ```

  ```js
  $("form").loadJSON({ Tags: ["new", "featured"] });
  ```

- For a single box driven by a boolean, give the box `value="1"`: `true` equals `"1"` loosely and
  checks it, `false` unchecks it. A box with no `value` attribute is not checked by `true`.

## Radio buttons

A radio button is checked when its `value` equals the loaded value, ignoring case, and unchecked
otherwise. Numbers and booleans are compared by their string form, so `3` checks `value="3"`.

## Selects

A single select selects the option whose value equals the loaded value:

```js
$("form").loadJSON({ Town: "Lothian" });
```

A multiple select selects each option whose value is the loaded value or is in the loaded array.
Options that were already selected stay selected.

```js
$("form").loadJSON({ Country: ["UK", "FRA"] });
```

### Adding options

An array of `{ value, text, selected }` objects adds options to a select instead. Each item gets a
copy of the select's last option, inserted after it, with its value and text set; `selected: true`
selects it. Event handlers on the last option are copied too.

```html
<select name="Region">
  <option value="">Choose a region</option>
</select>
```

```js
$("form").loadJSON({
  Region: [
    { value: 1, text: "East Europe" },
    { value: 2, text: "West Europe", selected: true },
  ],
});
```

```html
<select name="Region">
  <option value="">Choose a region</option>
  <option value="1">East Europe</option>
  <option value="2" selected>West Europe</option>
</select>
```

For a single select, any array adds options. For a multiple select, an array adds options only when
the select has one option or none; with more, the array is a list of values to select.

The existing options stay, so loading a second array adds to the first. To replace the options,
remove the old ones before loading:

```js
$("#Town").find("option:not(:first)").remove();
$("#Town").loadJSON(towns);
```

### Options loaded directly

An option matched by a key takes an object as its value, text and selected state:

```html
<select>
  <option class="Default"></option>
</select>
```

```js
$("form").loadJSON({ Default: { value: "", text: "Any", selected: true } });
```
