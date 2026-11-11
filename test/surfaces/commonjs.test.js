import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const pluginPath = require.resolve("../../dist/jquery.loadJSON.js");
const jqueryPath = require.resolve("jquery");

// Loads a file fresh, as Node's require would for a new consumer.
function requireFresh(path) {
  delete require.cache[path];
  return require(path);
}

function newWindow() {
  return new JSDOM('<div id="root"><span class="a"></span></div>').window;
}

afterEach(function () {
  delete globalThis.define;
  delete globalThis.window;
});

describe("the classic build", function () {
  describe("when required from CommonJS", function () {
    it("should export a factory that adds loadJSON to the jQuery it is given", function () {
      const window = newWindow();
      const jQuery = requireFresh(jqueryPath)(window);

      const result = requireFresh(pluginPath)(window, jQuery);

      expect(result).toBe(jQuery);
      expect(typeof jQuery.fn.loadJSON).toBe("function");
    });

    it("should build jQuery for the given window when no jQuery is passed", function () {
      const window = newWindow();
      requireFresh(jqueryPath);

      const jQuery = requireFresh(pluginPath)(window);

      expect(jQuery.fn.jquery).toBeTruthy();
      expect(typeof jQuery.fn.loadJSON).toBe("function");
    });

    it("should require jQuery directly when a global window exists", function () {
      globalThis.window = newWindow();
      const jQuery = requireFresh(jqueryPath);

      const result = requireFresh(pluginPath)(globalThis.window);

      expect(result).toBe(jQuery);
      expect(typeof jQuery.fn.loadJSON).toBe("function");
    });

    it("should load data with no global jQuery", function () {
      const window = newWindow();
      const jQuery = requireFresh(pluginPath)(window, requireFresh(jqueryPath)(window));

      jQuery("#root", window.document).loadJSON({ a: "x" });

      expect(window.document.querySelector(".a").textContent).toBe("x");
    });
  });

  describe("when loaded by an AMD loader", function () {
    it("should define an anonymous module that depends on jquery", function () {
      const jQuery = requireFresh(jqueryPath)(newWindow());
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
