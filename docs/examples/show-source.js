// Shows each example's own markup and script on the page, so the code you read is the code that
// runs. The markup is read before the example's script runs, so it is shown before loadJSON fills it.

// Removes the indentation the lines share. An element's outerHTML starts at its tag, so its first
// line has none and is left out of the count (skipFirst).
function dedent(text, skipFirst) {
  var lines = text.replace(/^\s*\n|\n\s*$/g, "").split("\n");
  var counted = skipFirst ? lines.slice(1) : lines;
  var indent = Math.min.apply(
    null,
    counted
      .filter(function (line) {
        return line.trim().length > 0;
      })
      .map(function (line) {
        return line.match(/^\s*/)[0].length;
      })
  );

  return lines
    .map(function (line) {
      return line.slice(Math.min(indent, line.match(/^\s*/)[0].length));
    })
    .join("\n");
}

document.querySelectorAll("pre[data-source]").forEach(function (pre) {
  var source = document.querySelector(pre.getAttribute("data-source"));
  pre.querySelector("code").textContent = dedent(
    source.outerHTML.replace(/ (multiple|selected|checked|disabled|hidden)=""/g, " $1"),
    true
  );
});

// The example's script comes after this one, so it is shown once the page is parsed.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("pre[data-script]").forEach(function (pre) {
    var script = document.querySelector(pre.getAttribute("data-script"));

    pre.querySelector("code").textContent = dedent(script.textContent);
  });
});
