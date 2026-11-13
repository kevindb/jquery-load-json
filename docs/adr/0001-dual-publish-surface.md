# Dual publish: classic `$.fn` and modern module

jQuery loadJSON is consumed as a classic jQuery plugin (script tag, AMD, CommonJS `(root, jQuery)` factory, `$.fn.loadJSON`) and must keep working that way. We publish **both** a modern module entry and a classic UMD build from the same source. ESM-only was rejected: it would break the long tail of script-tag and AMD users. Packaging changes preserve both surfaces, and published-file tests cover each one.
