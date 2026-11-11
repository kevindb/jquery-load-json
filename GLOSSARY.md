# jQuery loadJSON

A jQuery plugin that fills existing HTML markup, forms included, with values from a JSON object.

## Loading

**Template**:
The HTML markup that loadJSON fills: an element and everything inside it.
_Avoid_: view, form (when the markup is not a form)

**Saved template**:
A copy of a template's original markup, kept on the element so a later load can start from it.
_Avoid_: template cache

**Data**:
The JSON value loaded into a template: an object, an array or a single value.
_Avoid_: model, JSON object (when the value is not an object)

**Key**:
A property name in the data, used to find the elements that take its value.
_Avoid_: binding key, property (the older README wording), field name

**Scope**:
The element a key is looked up inside: the template for top-level keys, the match of the enclosing key for nested ones.
_Avoid_: context, container

**Match**:
The elements a key resolves to within its scope, found by class, then id, then name.
_Avoid_: binding, child, target

**Repeat**:
Loading an array by filling existing matching elements in order, then appending copies of the last one for the remaining items.
_Avoid_: clone, iteration, template (for the copied element)

## Element kinds

**Element kind**:
The category of an element that decides how a value is set on it.
_Avoid_: element type, input type (only some kinds are inputs)

**Field**:
A text-like input whose value is set directly, such as text, number, date or hidden.
_Avoid_: text input (not all fields are text)

**Checkbox**, **Radio**:
Inputs that become checked when their value equals the loaded value, or is among the loaded values for a checkbox group.

**Option**, **Select-one**, **Select-multiple**:
A select's option, set from a value and text; a single select, which selects a value or gains options from an array; a multiple select, which selects several values or gains options.

**Link**:
An anchor whose `href` takes the value, either as the whole address or as an added query parameter named after the key.

**Image**:
An image whose `src`, `alt` and `title` take the value.

**Content**:
Any other element, whose contents take the value.
_Avoid_: text element, HTML element

## Releases

**Deprecation notice**:
A console warning, shown only when debugging is turned on, that announces behavior removed in the next major version.
_Avoid_: deprecation warning, debug log
