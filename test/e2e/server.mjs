// End-to-end test server: serves a page with jQuery and the built plugin, and JSON fixtures.
// Environment: E2E_PORT (default 4320), JQUERY_FILE (classic jQuery build, default jQuery 3.7.1),
// PLUGIN_FILE (default dist/jquery.loadJSON.min.js).
import { createServer } from "node:http";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

const root = resolve(import.meta.dirname, "../..");
const port = Number(process.env.E2E_PORT || 4320);

const files = {
  "/jquery.js": resolve(root, process.env.JQUERY_FILE || "node_modules/jquery3/dist/jquery.js"),
  "/plugin.js": resolve(root, process.env.PLUGIN_FILE || "dist/jquery.loadJSON.min.js"),
};

const page = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>jquery-load-json e2e</title>
    <script src="/jquery.js"></script>
    <script src="/plugin.js"></script>
  </head>
  <body>
    <div id="person"><h1 class="name"></h1><span class="city"></span></div>
    <form id="form">
      <input name="email" />
      <select name="country"><option value="uk">UK</option><option value="fr">France</option></select>
      <input type="checkbox" name="tags" value="a" /><input type="checkbox" name="tags" value="b" />
    </form>
  </body>
</html>
`;

const json = {
  "/data/person.json": { name: "Ada Lovelace", city: "London" },
};

createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/page") {
    res.setHeader("Content-Type", "text/html");
    res.end(page);
  } else if (files[path]) {
    res.setHeader("Content-Type", "text/javascript");
    res.end(await readFile(files[path]));
  } else if (json[path]) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(json[path]));
  } else {
    res.statusCode = 404;
    res.end("not found");
  }
}).listen(port, "127.0.0.1");
