import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const pluginPath = require.resolve("../../dist/jquery.loadJSON.js");
const installedJQuery = require.resolve("jquery");

// Loads a file fresh, as Node's require would for a new consumer.
function requireFresh(path) {
  delete require.cache[path];
  return require(path);
}

function newWindow() {
  return new JSDOM('<div id="root"><span class="a"></span></div>').window;
}

// jQuery 3 builds from a window by calling the package export; jQuery 4 moved that to jquery/factory.
const jQueryBuilds = {
  "jQuery 3": (window) => requireFresh(require.resolve("jquery3"))(window),
  "jQuery 4": (window) => requireFresh(require.resolve("jquery4/factory")).jQueryFactory(window),
};

afterEach(function () {
  delete globalThis.define;
  delete globalThis.window;
});

for (const [version, buildJQuery] of Object.entries(jQueryBuilds)) {
  describe(`the classic build with ${version}`, function () {
    describe("when required from CommonJS with a jQuery", function () {
      it("should return that jQuery with loadJSON added", function () {
        const window = newWindow();
        const jQuery = buildJQuery(window);

        const result = requireFresh(pluginPath)(window, jQuery);

        expect(result).toBe(jQuery);
        expect(typeof jQuery.fn.loadJSON).toBe("function");
      });

      it("should load data with no global jQuery", function () {
        const window = newWindow();
        const jQuery = requireFresh(pluginPath)(window, buildJQuery(window));

        jQuery("#root", window.document).loadJSON({ a: "x" });

        expect(window.document.querySelector(".a").textContent).toBe("x");
      });
    });

    describe("when loaded by an AMD loader", function () {
      it("should define an anonymous module that depends on jquery", function () {
        const jQuery = buildJQuery(newWindow());
        const calls = [];
        globalThis.define = function (deps, factory) {
          calls.push({ deps, factory });
        };
        globalThis.define.amd = {};

        requireFresh(pluginPath);
        calls[0].factory(jQuery);

        expect(calls[0].deps).toEqual(["jquery"]);
        expect(typeof jQuery.fn.loadJSON).toBe("function");
      });
    });
  });
}

// These paths require the installed jquery package: the peer dependency `>=3.5` resolves to jQuery 4.
describe("the classic build required from CommonJS without a jQuery", function () {
  it("should require jQuery directly when a global window exists", function () {
    globalThis.window = newWindow();
    const jQuery = requireFresh(installedJQuery);

    const result = requireFresh(pluginPath)(globalThis.window);

    expect(result).toBe(jQuery);
    expect(typeof jQuery.fn.loadJSON).toBe("function");
  });

  it("should build jQuery 4 for the given window when there is no global window", function () {
    const window = newWindow();
    delete require.cache[installedJQuery];

    const jQuery = requireFresh(pluginPath)(window);
    jQuery("#root", window.document).loadJSON({ a: "x" });

    expect(window.document.querySelector(".a").textContent).toBe("x");
  });
});
