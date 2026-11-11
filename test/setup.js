import jQuery from "jquery";

window.$ = window.jQuery = jQuery;

// The plugin file is the classic UMD script: with no define() or module in scope it registers
// $.fn.loadJSON on the global jQuery set above.
await import("../src/jquery.loadJSON.js");
