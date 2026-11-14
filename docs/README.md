# jQuery loadJSON documentation

jQuery loadJSON fills HTML markup you already have, forms included, with values from a JSON
object. There is no template language: the plugin finds the elements whose class, id or name is a
key of the data and sets each one's value in the way that suits the element.

## Guides

- [Loading data](loading-data.md): templates, keys, matching, nested objects, arguments and
  callbacks.
- [Elements](elements.md): how text, links and images take a value.
- [Forms](forms.md): inputs, checkboxes, radio buttons, textareas and selects.
- [Arrays and repeats](arrays.md): generating lists from an array of objects.
- [Debugging and deprecations](debugging.md): `$.fn.loadJSON.debug` and the behavior that 2.0
  removes.
- [Migrating from 1.x to 2.0](migrating-to-2.md): every change in 2.0 and what to do about it.

## Examples

[Live examples](examples/index.html) run the built plugin with the current jQuery. Their source is
in [`docs/examples/`](https://github.com/kevindb/jquery-load-json/tree/main/docs/examples).

## Terms

These pages use a few words in a fixed sense:

- **Template**: the markup loadJSON fills, an element and everything inside it.
- **Data**: the value loaded into a template: an object, an array or a single value.
- **Key**: a property name in the data, used to find the elements that take its value.
- **Scope**: the element a key is looked up inside.
- **Match**: the elements a key resolves to within its scope.
- **Repeat**: loading an array by filling existing matching elements, then appending copies of the
  last one.
