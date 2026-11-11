import { afterEach, describe, expect, it } from "vitest";

const jquery3 = "/raw/node_modules/jquery3/dist/jquery.js";
const jquery4Module = "/raw/node_modules/jquery4/dist-module/jquery.module.js";

let frame;

// Loads `body` in a fresh iframe and resolves with the window.result the page sets.
function loadPage(body) {
  frame = document.createElement("iframe");
  frame.srcdoc = `<!doctype html><html><body>${body}</body></html>`;

  return new Promise((resolve, reject) => {
    frame.addEventListener("load", () => {
      const started = Date.now();
      (function poll() {
        if ("result" in frame.contentWindow) {
          resolve(frame.contentWindow.result);
        } else if (Date.now() - started > 5000) {
          reject(new Error("page never set window.result"));
        } else {
          setTimeout(poll, 20);
        }
      })();
    });
    document.body.appendChild(frame);
  });
}

afterEach(() => {
  frame?.remove();
});

describe("when a classic build is loaded by a script tag", () => {
  for (const file of ["jquery.loadJSON.js", "jquery.loadJSON.min.js"]) {
    it(`should register $.fn.loadJSON on the global jQuery (${file})`, async () => {
      const page = `<div id="root"><span class="a"></span></div>
        <script src="${jquery3}"></script>
        <script src="/raw/dist/${file}"></script>
        <script>
          jQuery("#root").loadJSON({ a: "x" });
          window.result = jQuery(".a").text();
        </script>`;

      const result = await loadPage(page);

      expect(result).toBe("x");
    });
  }
});

describe("when the classic build runs its factory", () => {
  it("should run the plugin body in strict mode", async () => {
    // A sloppy-mode write to a read-only property is silently ignored; a strict one throws.
    const page = `<script src="${jquery3}"></script>
      <script>
        Object.defineProperty(jQuery.fn, "loadJSON", { value: null, writable: false });
        window.onerror = function (message) {
          window.result = message;
        };
      </script>
      <script src="/raw/dist/jquery.loadJSON.js"></script>
      <script>
        if (!("result" in window)) {
          window.result = "no error";
        }
      </script>`;

    const result = await loadPage(page);

    expect(result).toMatch(/read.only property 'loadJSON'/);
  });
});

describe("when the classic build is loaded through AMD", () => {
  it("should register on the jquery module and define no value", async () => {
    const page = `<script src="/raw/node_modules/requirejs/require.js"></script>
      <script>
        require.config({ paths: { jquery: "${jquery3.slice(0, -3)}", plugin: "/raw/dist/jquery.loadJSON" } });
        require(["jquery", "plugin"], function ($, plugin) {
          window.result = { plugin: typeof $.fn.loadJSON, value: plugin };
        });
      </script>`;

    const result = await loadPage(page);

    expect(result).toEqual({ plugin: "function", value: undefined });
  });
});

describe("when the module build is imported natively with jQuery 4", () => {
  it("should register on the imported jQuery and export it as default", async () => {
    const page = `<script type="importmap">{ "imports": { "jquery": "${jquery4Module}" } }</script>
      <script type="module">
        import $ from "jquery";
        import plugin from "/raw/dist/jquery.loadJSON.mjs";
        window.result = { plugin: typeof $.fn.loadJSON, sameJQuery: plugin === $ };
      </script>`;

    const result = await loadPage(page);

    expect(result).toEqual({ plugin: "function", sameJQuery: true });
  });
});
