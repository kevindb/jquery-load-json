# Plan: modernize jquery-load-json

Internal working plan. Public text (README, docs, release notes, issue comments) does not mention
phases or link here.

Template: `~/Sites/jquery-form/form` (Vitest browser mode, Rollup dual build, ESLint flat + Prettier,
GitHub Actions CI/CodeQL/release with npm trusted publishing). Copy and adapt; do not invent new
tooling. Its heavier process (stacked phase branches, probe suites, CodeQL canary, CI timing
instrumentation, model tables) is out of scope. Mutation testing is in, as jquery-form ran it: one-off
local Stryker reports, not a dependency or a CI step (Phase 4).

## Starting state (2026-11-11)

- One file, `src/jquery.loadJSON.js` (classic UMD, ~400 lines). No tests. Grunt + uglify builds
  `dist/jquery.loadJSON.min.js`. `main` is `src/`, `browser` is the min file. `jquery` is a runtime
  `dependency` (`^3.4.1`) although README and `bower.json` say jQuery 1.7+.
- License: `package.json`, `bower.json`, `composer.json` say `LGPL-2.1` (a deprecated SPDX id). The
  source header says LGPL 2.1 "or (at your option) any later version", i.e. `LGPL-2.1-or-later`.
- npm: latest is **1.3.3** (2017-03-04). 1.3.2 was published and later unpublished. **v1.3.4 was
  tagged and released on GitHub (2018-07-05) but never `npm publish`ed**, so npm users never got the
  multi-select fix in it. 1.4.0 supersedes it and the release notes say so. 1.3.4 is not published
  from the tag: its `package.json` narrows `jquery` from `>=1.7` (1.3.3 on npm) to `^3.3.1`, which
  in a patch would install a second jQuery for jQuery 1/2 users and attach the plugin to it; it
  also lists "Mike Alsup" as a contributor and ships 127 files / 573 kB (examples included).
- The trunk's `package.json` declares `jquery: ^3.4.1`. 1.4.0 restores `>=1.7` to keep npm's current contract.
- Open PRs: Dependabot #30, #34, #35, #36, #38 (Grunt/jQuery lockfile bumps, all superseded once Grunt
  goes); community fix #28 (`element[0]` to `$element[0]` in the array branch).
- Open issues: #32 (wiki "live example" links 404: they point at the dead
  `jquery-load-json.googlecode.com` SVN host); #25 (Jovan Popovic announcing jquery-view-engine).
- jquery-form `main` still has `.github/issue_template.md` copied from this repo (a `**LoadJSON:**`
  version field, no link here). Its unmerged phase-13/14 branches replace it with `ISSUE_TEMPLATE/`.

Bugs visible by reading, before tests (the Findings section has the tested results):

- Every call assigns `Array.prototype.contains` (global prototype pollution).
- `$.parseJSON` and `$.isFunction` are removed in jQuery 4: JSON-string input throws there.
- The factory body uses the global `jQuery` in places instead of `$`, so CommonJS without a global
  jQuery fails.
- Loading an array into a raw DOM element reads `element[0].tagName` on a non-jQuery node and throws
  (what #28 fixes).
- `rel="prop"` lookup ignores the context and searches the whole document.
- Keys are concatenated into selectors (`'.' + prop`, `'#' + prop`): keys with `.`, `:`, spaces etc.
  throw or match the wrong element.
- `img`: `obj.constructor == 'String'` is always false and reads the outer `obj`, not `value`.
- `a`: `iPosition > 1000000` is dead; appended query values are not URL-encoded.
- `init()` template caching compares `.data()` to `null`/`''` but it is `undefined`, so the cache
  never takes effect as intended.
- Default branch sets `.html(value)`: string data is inserted as HTML (XSS sink).
- `mobile` option is never read.

## Decisions (defaults picked; the maintainer-only ones are marked)

- Branches: `release-1.4` then `release-2.0`, each one PR to `main`. Trunk stays `main`.
  After 2.0, 1.x patches come from an on-demand `release/1.x` cut from the last 1.x tag;
  npm dist-tags `latest` (2.x) and `v1`.
- Node 26 via `.nvmrc` and `devEngines`. Plain JS, no TypeScript.
- Vitest browser mode (Playwright provider, v8 coverage), Rollup, ESLint flat + Prettier
  (`printWidth: 100`, `trailingComma: "es5"`), same as the template.
- jQuery test matrix: **1.7.2** (the documented floor, fetched by `scripts/fetch-jquery.sh`),
  **3.7.1** and **4.0.0**, on Chromium, Firefox and WebKit in CI. Locally Chromium + WebKit;
  Firefox with `JQUERY_LOAD_JSON_FIREFOX=1`.
- `src/jquery.loadJSON.js` becomes an ES module; Rollup builds `dist/jquery.loadJSON.js` (classic UMD,
  same CommonJS `(root, jQuery)` factory), `dist/jquery.loadJSON.mjs` and the min file + source map.
  `dist/` stays committed and CI checks it matches a fresh build. `main` moves to `dist/`,
  `module` added, `browser` dropped in Phase 5 (see there). No `exports` map in 1.x. bower/composer point at `dist/`.
  Caveat: a deep path to `src/jquery.loadJSON.js` gets ESM in 1.4 (same trade-off jquery-form made).
- 1.4 deprecation warnings: `$.fn.loadJSON.debug = true` makes each 2.0 removal `console.warn` once
  per page when that code path runs. Off by default, so 1.4 output is unchanged.
- Docs: README becomes a landing page linking to `docs/` (wiki content moved in-repo, fixed links);
  GitHub Pages serves `docs/` with working copies of the examples, which closes #32.
- **Maintainer (decided 2026-11-11):**
  - License id `LGPL-2.1-or-later` in every manifest (matches the source headers); LICENSE.md text
    unchanged.
  - 2.0 jQuery floor: `>=3.5` as a peer dependency. 2.0 matrix: 3.5.1, 3.7.1, 4.0.0.
  - 2.0 removes: the `Array.prototype.contains` patch, jQuery Mobile refresh hooks, the `mobile`
    option and the `src$alt` img string; `rel` attribute matching (keys and `rel=index` array
    children); the URL string argument (built-in `$.ajax`); the top-level `src`/`alt`/`title`
    fallback for images (added 2026-11-11 in Phase 3, see Findings).
  - 2.0 changes: non-form elements get `.text(value)` by default; `html: true` opts back in to
    `.html(value)`.
  - Manifests: drop `bower.json` in 2.0. Keep `composer.json` (14 Packagist installs; it costs one
    file covered by the manifests test), with `components/jquery` raised to the 2.0 floor.

## Phase 0: Groundwork

- `AGENTS.md`, `docs/agents/{coding-standards,issue-tracker,domain}.md`, `docs/adr/0001` (dual
  publish: classic `$.fn` + module) and `0002` (branching and release), adapted from jquery-form.
- This plan.

Done when: the maintainer has approved this plan (decisions recorded above).

## Phase 1: Coverage first (no source changes)

- Minimal harness only: `package.json` devDeps (Vitest, Playwright provider, v8 coverage, jQuery
  3.7.1 / 4.0.0), `vitest.config.mjs`, `test/setup.js`, `scripts/fetch-jquery.sh`. Grunt stays for
  now. `src` is not touched: the suite loads the classic UMD file as is (no `define`/`module`, so it
  registers on the global jQuery) and v8 measures it.
- Tests in `test/suite/` (BDD names, AAA shape), branch by branch toward 100%: matching by class /
  id / name / rel, each input type, checkbox and radio groups, select-one and select-multiple
  (select vs populate), arrays (clone last element, `rel=index` children), nested objects, `a` and
  `img`, JSON string vs object vs URL argument (AJAX fixture), `onLoading`/`onLoaded`, template
  re-use on a second call.
- Every finding is sorted into one of three records, kept in a findings section of this file:
  - **Pin**: current behavior, tested as is. Stays in 1.x; may change in 2.0.
  - **Bug**: an `it.fails` test of the intended behavior. Fixed in 1.x when low risk, else 2.0.
  - **Dead**: a branch no input can reach, with the reason. Not excluded with `v8 ignore`.
- Run the suite on jQuery 1.7.2, 3.7.1 and 4.0.0 locally to sort version-specific behavior early.

Done when: coverage is 100% or every uncovered branch is listed as dead, thresholds are set at that
level, and each item in the bug list above is recorded as pin, bug or dead.

Status: done 2026-11-11 (see Findings).

## Phase 2: Tooling and CI

- Convert `src` to ESM (body unchanged), add `rollup.config.mjs` (classic UMD wrapper kept),
  `eslint.config.mjs`, Prettier config; Prettier sweep as its own commit + `.git-blame-ignore-revs`.
  The Phase 1 suite, unchanged, proves the conversion and sweep change no behavior.
- Surface tests in `test/surfaces/`: script tag, AMD (RequireJS), native ESM with jQuery 4,
  CommonJS factory, and manifests (`package.json`/`bower.json`/`composer.json` entries exist, agree,
  and match the published file list).
- Small Playwright e2e (`playwright.config.mjs`): the built plugin in a real page loading JSON by URL
  from a local server.
- `.github/workflows/ci.yml` (lint, format, build, coverage, dist check; jQuery x browser matrix;
  e2e), `codeql.yml` replacing `codeql-analysis.yml`, `release.yml` (trusted publishing,
  provenance, `npm` environment), `dependabot.yml`, `ISSUE_TEMPLATE/` (bug form + config).
- Remove Grunt, `Gruntfile.js`, `.editorconfig`, `issue_template.md`. `files` in `package.json`;
  `jquery` dependency back to `>=1.7`; license id `LGPL-2.1-or-later`.
- `npm test` = lint + format:check + build + coverage (+ Firefox and WebKit run).
- Repository meta: rename `master` to `main` (done 2026-11-11; GitHub retargeted the open PRs and
  redirects old links); private vulnerability reporting + `SECURITY.md`; description, homepage and
  topics; Actions pinned to current majors. Branch protection and the `npm` environment wait until CI
  reports a `test` check (Phase 5). The wiki is disabled once its pages live in `docs/` (Phase 4).

Done when: `npm test` passes locally, CI is green on the PR for all 9 jQuery x browser cells,
`npm pack --dry-run` lists only the intended files, and coverage is unchanged from Phase 1.

Status: done 2026-11-11. `master` renamed to `main`. `src` is an ES module built by Rollup (classic
UMD + `.mjs` + min/map); ESLint + Prettier with the sweep in `.git-blame-ignore-revs`; Grunt and
`.editorconfig` removed. Surface (script tag, AMD, native ESM), CommonJS (jQuery 3 and 4), manifest
and Playwright e2e tests. CI (`test` + 9 jQuery x browser cells running suite and e2e), CodeQL
(JavaScript + Actions, `security-extended`), `release.yml`, Dependabot, bug form, `SECURITY.md`;
all green on PR #39 with no code-scanning alerts. Repo: private vulnerability reporting on, new
description, npm homepage, topics (dropped the misleading `ajax-form`), delete branch on merge.
`npm pack`: 8 files, 24.8 kB (1.3.4 tag: 127 files, 573 kB).

Coverage thresholds are 90.8 / 89.55 / 100 / 90.47: lower than Phase 1 only because the fully
covered UMD wrapper moved from `src` into `rollup.config.mjs`; the same 14 dead branches remain.
The `release.yml` rehearsal by `workflow_dispatch` needs the workflow on `main`, so it moves to
Phase 5, after this PR merges. ESLint warnings left for the refactors: `no-redeclare` (2),
`no-useless-assignment` (2), `no-prototype-builtins` (1).

## Phase 3: Architecture review

- The maintainer runs `/improve-codebase-architecture` on the formatted, fully tested source.
- Each deepening opportunity is sorted: **1.x** (a refactor no test notices, e.g. splitting
  `setElementValue` per element kind, one element-lookup function, removing dead branches),
  **2.0** (needs a removal or behavior change from the approved list), or **no**.
- Record any ADR or `GLOSSARY.md` terms the review resolves (template, binding key, element kind).

Done when: every opportunity has a disposition in the findings section.

Status: done 2026-11-11. Eight opportunities, each with a disposition (see Findings,
Architecture review). The image question is decided and the terms are in `GLOSSARY.md`; no ADR
was needed.

## Phase 4: 1.x fixes and refactors (non-breaking)

- First, a one-off mutation-testing report: Stryker run locally with `npx` (not added to
  `devDependencies` or CI) over `src/jquery.loadJSON.js` against the Vitest suite on Chromium with
  jQuery 3.7.1; timeouts count as detected. Record the score and the surviving mutants in Findings,
  then add tests for the gaps before any refactor, through `$.fn.loadJSON` only. A survivor that
  sits in a dead branch is listed, not tested. Survivors in `setElementValue` and the key match
  matter most: A2 and A3 split them. Re-run once the 1.x refactors are in and record both scores.

- Land #28 by rebasing its commit onto the branch (keeps Francesco Angi's authorship); add them to
  `CONTRIBUTORS.md`.
- Low-risk bugs from Phase 1, each flipping its `it.fails`. Candidates: jQuery 4 removals
  (`$.parseJSON`, `$.isFunction`), global `jQuery` use, raw-DOM array load, selector escaping for
  keys, `img` string format, `a` encoding, template caching. A fix that changes a pinned behavior
  waits for 2.0.
- The 1.x refactors from Phase 3, each its own `refactor` commit with the suite green before and
  after. Bug fixes and refactors are not mixed in one commit. Order (each step names the review
  item, see Findings):
  1. A1: move the inner functions to module scope; pass the outer argument as `data` where today's
     behavior reads it.
  2. Fix commits for select (array by key x2, own values, one-option multiple), image (string,
     object) and link (fragment). Each fix comes before the A2 refactor, because the dead branches
     only go away with the fix that makes them live or removes them.
  3. A2: element-kind module (`kindOf` + one function per kind).
  4. A5: legacy module (`contains`, Mobile refresh, `notice(id)` behind `$.fn.loadJSON.debug`);
     checkbox stops using `contains`.
  5. A3: key-match module, then the selector-escaping fix in it.
  6. #28, then A4 (kinds take whole values; walk split by value shape) and A6 (argument
     normalization with the `JSON.parse` fix).
- Add the `debug` flag and a deprecation notice at each 2.0 removal point (sites in Findings,
  Architecture review).
- Docs: README landing page, `docs/` from the wiki, examples on GitHub Pages, CDN snippets,
  `SECURITY.md`, CONTRIBUTING updated for the new commands.

Done when: the only remaining `it.fails` are bugs deferred to 2.0, coverage is back at 100% (dead
branches removed by the refactors), and the jQuery 1.7.2 / 3.7.1 / 4.0.0 matrix is green on all
three browsers.

Status: code steps done 2026-11-11 on `release-1.4` (pushed; PR #39 green on all checks); docs are a
separate session.

Docs done 2026-11-11 on `release-1.4`: README is a landing page (npm, CDN without SRI until Phase 5,
credit and jquery-view-engine link for #25); the four wiki pages are rewritten for 1.4 as
`docs/{loading-data,elements,forms,arrays}.md`, plus `docs/debugging.md` for `debug` and every
notice in `src/legacy.js`; `docs/examples/` holds eight working examples on jQuery 4.0.0 (code.jquery.com,
SRI) and a copy of the classic build that Rollup writes and CI diffs with `dist/`. Bing Maps (needs a
key) and the jQuery Mobile pages are not ported, and the old `examples/` folder with its vendored
libraries (the 17 code-scanning alerts) is deleted (maintainer, 2026-11-11); DataTables and LINQ are replaced by plain jQuery and
`Array.prototype.filter`. CONTRIBUTING has the current commands. GitHub Pages is not enabled yet
(maintainer: Settings, Pages, deploy from `main` `/docs`), so the example links 404 until then.
`JQUERY_LOAD_JSON_FIREFOX` from the Decisions was never implemented: `npm test` runs Firefox too, and
CONTRIBUTING says so.
Mutation score 76.06% before, 96.59% after (Findings). Fixes: select x4, image, link x2 (fragment,
and the query-only `href` the mutation run found), keys that are not valid selectors, `contains`
non-enumerable, #28 (Francesco Angi, adapted to read the first item of an array-like element so
selects keep their options), `JSON.parse`, and the CommonJS header (`jquery/factory` when present,
checked by hand against jQuery 3). Refactors A1 to A6 as listed; the source is now four modules:
`jquery.loadJSON.js` (entry and walk), `element-kinds.js`, `key-match.js` and `legacy.js`
(`installContains`, `refreshMobile`, `notice`). `$.fn.loadJSON.debug` shows a deprecation notice
once per page at every site in the Architecture review table. Coverage is 100% and enforced; ESLint
has no warnings and its temporary overrides are gone. The remaining `it.fails` are the four 2.0 bugs
(dot key, rel outside, link encoding, template caching) plus, on jQuery 4 only, the five pinned jQuery
Mobile skips. All 9 jQuery x browser cells and the Playwright e2e pass locally.

The key-match fix differs from the A3 note: instead of retrying with an escaped key (the Sizzle in
jQuery 1.7 does not read CSS escapes in class names), a step whose selector is invalid (jQuery
throws, or matches nothing for a selector the browser rejects as CSS) compares each element's
attribute with the key. A dot key is valid CSS, so it still builds a compound selector, as pinned.

## Phase 5: 1.4.0 release

- Maintainer: add the GitHub Actions trusted publisher on npmjs.com for `release.yml` + environment
  `npm`. Agent: create the `npm` environment (v* tags only, maintainer approval), protect `main`
  (PR + `test` check).
- Version 1.4.0, header, CDN snippets with SRI on `release-1.4`; mark PR #39 ready, review and
  merge it. PR #39 is the whole 1.4 release (ADR-0002), so it stays a draft until here.
- After merge: rehearse `release.yml` by `workflow_dispatch` on `main` (a dispatch needs the
  workflow on the default branch, and on a non-tag ref it runs verify only, never publish).
- Then tag `v1.4.0`, maintainer approves the publish, GitHub release notes (fixes, jQuery 4
  support, the 1.3.4 changes that never reached npm, deprecations, credit for #28).
- Close Dependabot #30 #34 #35 #36 #38 with a comment; comment on and close #32 (examples live,
  wiki links fixed) and #25 (thank Jovan, link jquery-view-engine from the README).
- Note for jquery-form: its `main` still carries the copied `issue_template.md`; it goes when its
  phase-13/14 work merges.

Done when: `npm view jquery-load-json` shows 1.4.0 with provenance, the release exists, and the
listed PRs and issues are closed.

Status (2026-11-12): Phase 4 verified (`npm test`, e2e and PR #39 CI green; 100% coverage; only the
2.0 `it.fails` left). GitHub Pages is on (`main` `/docs`); the wiki was still on then (disabled 2026-11-13). On `release-1.4`:
version 1.4.0, SRI on the README CDN snippets with a test against the min build's hash, and the
`browser` field dropped. A bundler that reads `browser` first (rolldown, esbuild) bundled the classic
min build, whose CommonJS branch only exports the factory, so `import "jquery-load-json"` never
registered the plugin (1.3.3 had the same field). Bundlers now take `module`; Browserify takes `main`;
`jsdelivr`/`unpkg` keep the min file. `test/surfaces/bundlers.test.js` bundles with rolldown.

Added from jquery-form's 4.4.0–4.6.0 releases, before the merge and tag:

- Done (`083d9f1`): exclude `plans/`, `agents/` and `adr/` from the Pages build (`docs/_config.yml`), then check that
  `/plans/modernization/` is a 404 after the merge.
- Done: the suite against the npm 1.3.3 file (Findings, Compared with npm 1.3.3).
- Done 2026-11-12 (maintainer, on npmjs.com; `release.yml` + environment `npm`): trusted publisher with publish permission only, 2FA required, tokens disallowed, maintainer
  list reviewed. After publishing, hash the jsDelivr and unpkg files against the README SRI; check
  Packagist.
- Done 2026-11-12 (maintainer ran the commands): `main` requires a PR and the `test` check only
  (GitHub Actions; matrix check names may change), 0 approvals, admins not enforced. Environment
  `npm`: reviewer kevindb, self-review allowed, deploys only from `v*` tags, as in jquery-form.
- Give 1.4.0 a few days before 2.0 (no fixed timeline), so a regression can ship as 1.4.x first.

Released 2026-11-13. PR #39 merged as `e89f3d8`; the `release.yml` rehearsal on `main` passed
(verify only, publish skipped). Tag `v1.4.0` (annotated, on `e89f3d8`), publish approved by the
maintainer: npm `latest` is 1.4.0 with SLSA provenance (`gitHead` `e89f3d8`, Sigstore log index
3846299961). The tarball's min file, jsDelivr and unpkg all match the README's SRI hash (the CDNs
cached a 404 for about four minutes after the publish). Packagist has `v1.4.0`. GitHub Pages serves
`docs/` and the examples; `plans/`, `agents/` and `adr/` return 404. GitHub release `v1.4.0` is
published from the 1.3.3 comparison. Closed with a comment: Dependabot #34 #35 #36 #38 (#30 was
already closed), #32, #25 and #28. Dependabot's first grouped PR (#40) merged under the new
protection. npm normalized `repository.url` on publish; the follow-up PR applies `npm pkg fix`.
Phase 5 is done. The wiki was disabled on 2026-11-13; its pages live in `docs/`.

## Phase 6: 2.0.0 (breaking)

- `jquery` moves from `dependencies` to `peerDependencies` at the chosen floor; `exports` map.
- Remove the approved list (below) and its 1.4 warnings; drop shims for jQuery below the floor and
  the 1.7.2 cell from the matrix (replace with the floor version).
- On the 1.x shapes (review item A7): delete the legacy module and its call sites; drop the rel
  step from match and the rel-children arm from the walk; escape keys with `$.escapeSelector`
  (fixes dot keys); content kind uses `.text()` unless `html: true`; template reset inside the
  load path; link kind encodes values; argument normalization loses the URL arm.
- `docs/migrating-to-2.md`: each removal, the 1.4 warning text that announced it, and the replacement.
- Coverage to 100% once the dead branches are gone.
- Release as in Phase 5 on `release-2.0`; cut `release/1.x` from `v1.4.x` and tag `v1` on npm.

Done when: 2.0.0 is on npm with provenance, the migration guide is linked from the README, and every
1.4 debug warning maps to a guide entry.

## Findings

Phase 1 results (2026-11-11): 79 tests + 14 `it.fails` per run; the suite is green on jQuery 1.7.2,
3.7.1 and 4.0.0 in Chromium, Firefox and WebKit. 1.7.2 and 3.7.1 behave identically; 4.0.0 adds the
five `itBeforeJQuery4` failures. Coverage of `src/jquery.loadJSON.js`: 91.35% statements, 90.41%
branches, 100% functions, 91.06% lines; thresholds are set there. Every uncovered branch is dead.

Root cause of several bugs: commit 96d1690 ("Minor changes to pass JSHint", 2015) turned
`== null` checks into `=== null`, which no longer catch `undefined`. Every published version has it.

### Bugs (`it.fails`, intended behavior)

| Bug                                                                                                                                                                        | Test                                          | Fix in                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| JSON-string argument throws on jQuery 4 (`$.parseJSON` removed)                                                                                                            | arguments: JSON string (x3, 4.0 only)         | Fixed in 1.4 (`2dcb338`, `JSON.parse`)                                     |
| CommonJS factory with no window calls `require('jquery')(root)`, which jQuery 4 does not export (it builds from `jquery/factory`), so the plugin registers but cannot load | commonjs: build jQuery 4 for the given window | Fixed in 1.4 (`1d93d7b`, UMD header)                                       |
| Loading an array into the plugin's own element throws reading `element[0].tagName` (#28)                                                                                   | arrays: copy of the element (#28)             | Fixed in 1.4 (`1d972fe`, #28 adapted)                                      |
| Array value for a select by key throws (`type === null` misses `undefined`)                                                                                                | form-fields: select array by key              | Fixed in 1.4 (`fe33dd0`)                                                   |
| Array of values for a multiple select by key throws (same cause)                                                                                                           | form-fields: multiple select array            | Fixed in 1.4 (`e22bbb7`)                                                   |
| `loadSelect` reads the outer argument, not its own values, so options are added only when the select itself is loaded; a JSON array string adds one option per character   | arguments: array string into a select         | Fixed in 1.4 (`94cdd6f`)                                                   |
| Scalar into a multiple select with one option is ignored (`options.length > 1`, 1.3.3 and 1.3.4)                                                                           | form-fields: one-option multiple select       | Fixed in 1.4 (`be00bd1`)                                                   |
| String image value is ignored (`obj.constructor == 'String'` is never true)                                                                                                | links-images: src string                      | Fixed in 1.4 (`1643e39`; value as `src` only)                              |
| Object image value `{src, alt, title}` is ignored; images read the outer argument                                                                                          | links-images: object value                    | Fixed in 1.4 (`1643e39`)                                                   |
| Link parameter is appended after a `#fragment`                                                                                                                             | links-images: before a fragment               | Fixed in 1.4 (`d96dcbb`)                                                   |
| Link `href` that is only a query (`?x=1`) gets a second `?` (`iPosition > 0`; found by mutation testing)                                                                   | links-images: href is only a query            | Fixed in 1.4 (`14ebd05`, maintainer)                                       |
| Key that is not a valid selector throws on jQuery 3/4, misses on 1.7                                                                                                       | matching: not a valid selector                | Fixed in 1.4 (`7e99aac`; compares attributes when the selector is invalid) |
| Key with a dot builds a compound selector (`.a.b`)                                                                                                                         | matching: class containing a dot              | 2.0 (1.x pins it)                                                          |
| `rel` lookup ignores the loaded element and searches the document                                                                                                          | matching: rel outside                         | 2.0 removes `rel`; 1.x warns under `debug`                                 |
| Link values are not URL-encoded                                                                                                                                            | links-images: encode the value                | 2.0 (encoding changes existing output)                                     |
| Template is never cached, so a second call loads into the first call's output                                                                                              | template: original markup                     | 2.0 (resetting the DOM drops handlers bound since)                         |
| `Array.prototype.contains` is enumerable on every array                                                                                                                    | side-effects: enumerable property             | Non-enumerable in 1.4 (`665eecd`); 2.0 removes                             |

### Compared with npm 1.3.3 (Phase 5, 2026-11-12)

The suite at `083d9f1`, run on Chromium against the `src/jquery.loadJSON.js` published as 1.3.3 (the
version npm users have; `main` pointed at `src/`). jQuery 3.7.1: 94 pass, 31 fail; jQuery 4.0.0: 89
pass, 36 fail. Every failure is a 1.4 change, so this list is the source for the release notes:

- From the 1.3.4 tag, never on npm (its source differs from 1.3.3 in two lines): a `null` value no
  longer throws `TypeError`; a scalar into a multiple select with no options no longer throws.
- The fixes in the Bugs table: JSON strings on jQuery 4 (the 5 extra jQuery 4 failures), #28 (and the
  pinned repeat of the loaded element that used to throw), select x4, image string and object, link
  fragment and query-only `href`, keys that are not valid selectors (6), `contains` non-enumerable.
  The one-option multiple select was ignored in 1.3.3 as well, not only from 1.3.4.
- New: `$.fn.loadJSON.debug` (off by default) and the nine deprecation notices.

No test passes on 1.3.3 and fails on 1.4.

### Pinned behavior (tested as is)

- Matching order is class, then id, then name, then `rel`; class and id lookups stay inside the
  loaded element. Empty keys and `null`/`undefined` values are skipped.
- Non-form elements, `<button>` and `<textarea>` get `.html(String(value))`; textarea markup ends up as
  text. Submit, button and file inputs are untouched. A prototype-less object value is ignored.
- Checkboxes compare loosely (`1` checks `value="1"`); `true` does not check a value-less box. Radios
  compare case-insensitively on the string form.
- A multiple select keeps options that were already selected.
- Arrays fill existing elements in order, then append copies of the last one (handlers copied);
  extra existing elements are left as is; `rel=index` children take `array[index]`. Since #28 this
  also holds for an element loaded directly (it used to throw `TypeError`).
- An array loaded into a select itself appends options; `["y"]` into a multiple select with options
  appends a copy of the last option and selects nothing.
- Links: no `href` becomes the value; otherwise `?key=value` / `&key=value`, unencoded; a link
  loaded directly gets `undefined` as the key.
- The top-level `src`/`alt`/`title` of the argument are set on every matched image whose own value is
  neither a string nor an object (since 1.4; before, whatever the own value).
- A string starting with anything but `{` or `[` (leading whitespace included) is a URL; the request
  is `dataType: "json"`, `cache: false`, and a failed request does nothing and calls no callback.
- `null` or no argument throws `TypeError`. Callbacks run once per element, with no arguments,
  as methods of an internal copy of the options (one copy per call, the URL path included since
  A6). `mobile` is accepted and ignored.
- `loadJSON-template` data set to markup replaces the content first; set to `null` or `""`, the
  current markup is saved and restored on the next call.
- jQuery Mobile `selectmenu`/`checkboxradio` refresh runs before jQuery 4 and is silently skipped on 4
  (`$.isFunction` removed); errors from it are swallowed.

### Dead branches (14, not excluded from coverage)

All 14 are gone in 1.4 (Phase 4): the select, image and link fixes removed or revived them, A2
removed the rest, and the 14th (the values ternary) is live and covered. Coverage is 100% and
`vitest.config.mjs` requires it. As found in Phase 1:

- `if (type === null)` and its inner fallback (5 branches): `type` is never `null`; the fallback was
  meant for `undefined`. Fixing the select bugs above makes it live.
- `case 'select'`: a select's `type` is always `select-one` or `select-multiple`.
- `select-multiple` options guard (3 branches): `element[0]` is always an option or `undefined`, so
  `select` is always reset to `element`; the `options === null/undefined` checks are never reached.
- `value.constructor == Array ? value : [value]` true arm: an array only arrives through the select
  path that throws today.
- `iPosition > 1000000` in links: a fragment index is never that large.
- Image `obj.constructor == 'String'` and its `src$alt` parsing (3 branches): never true.

`case 'datetime'` never matches either (browsers report an obsolete `type="datetime"` as `text`),
but it shares an arm with live labels, so coverage cannot count it.

Correction (Phase 3): the bug list above originally blamed the plugin body's use of the global
`jQuery` for the CommonJS failure. Since the ESM conversion the body uses the imported binding (the
factory parameter in the classic build); the failure is the UMD header's jQuery 4 resolution.

### Mutation testing (Phase 4, 2026-11-11)

One-off local run: `npx -p @stryker-mutator/core@10.1.1 -p @stryker-mutator/vitest-runner@10.1.1
stryker run`, mutating `src/jquery.loadJSON.js` at `175e6ec` against the suite on Chromium with
jQuery 3.7.1, `perTest` coverage; timeouts count as detected. The Stryker and Vitest configs were
temporary and are not committed.

| Run                   | Mutants | Killed | Timeout | Survived | No coverage | Score  | Score (covered) |
| --------------------- | ------- | ------ | ------- | -------- | ----------- | ------ | --------------- |
| Before (88 tests)     | 472     | 351    | 8       | 75       | 38          | 76.06% | 82.72%          |
| After gap tests (102) | 472     | 388    | 8       | 38       | 38          | 83.90% | 91.24%          |
| After refactors       | 499     | 473    | 9       | 17       | 0           | 96.59% | 96.59%          |

The third row is the re-run at the end of Phase 4 (`cf76d99`), mutating all of `src/`
(`jquery.loadJSON.js`, `element-kinds.js`, `key-match.js`, `legacy.js`) after a second round of gap
tests (`e1317a4`: textarea content, a scalar that contains a checkbox value, a fragment-only `href`,
the name fallback, the `contains` descriptor, and the debug notices that must not fire). Its 17
survivors: equivalent (12: unanchored field and select regexes, `<=` in two loops, the `'"]'` and
prefix strings that the attribute fallback or CSS end-of-input recovers, an emptied `isValidCss`
catch, the `length > 0` short-circuit before matching, the `element.length >= 0` checkbox guard, the
unread `mobile` default) and debug-notice conditions only (5: a `$` at index 0, and which of
`src`/`alt`/`title` triggers the fallback notice).

Gap tests added in the first round (37 survivors killed, all through `$.fn.loadJSON`):

- Select: appended options copy event handlers (both `clone(true)` calls); an option loaded from an
  object with `selected: true` is selected (the old test only checked an option already first); a
  multiple select compares a scalar with each option's whole value (`"yes"` does not select `"y"`).
- Radio: a matched radio in another group is unchecked when its value differs.
- Mobile: `selectmenu("refresh")` after appending options to a select-one and a select-multiple
  (kills the `element.length == 1` and select-type operands of the array branch), and after selecting
  values in a multiple select.
- Arguments: a scalar sets each control of a form, and the content of a form with no controls; a
  JSON array string is parsed (rel children); a JSON string runs `onLoading`/`onLoaded` and applies
  the saved template.
- Template: `loadJSON-template` set to `""` saves and restores like `null`.
- New bugs (`it.fails`): an array string into a select adds one option per character; an `href`
  that is only a query gets a second `?`.

All 38 uncovered mutants are in the dead branches (type sniff 8, multiple guard 6, link 6, image 18).
The 38 survivors left:

| Kind                                  | Mutants                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In the dead branches (13, not tested) | type sniff `type === null` (1); multiple guard (3); values ternary true arm (1); `case 'select'` and the array branch's `element.type == "select"` operand (3); link `indexOf("#")` and `> 1000000` (3); image `obj.constructor == 'String'` (2)                                                                                                                                                                                                                                                                        |
| Equivalent (22)                       | Mobile `$.isFunction` → true (2, the try/catch swallows the call); `j <= values.length` (1); `case 'datetime'`, `'textarea'`, `'submit'`, `'button'` → `""` (4, same arm or default); key null/undefined checks (6, `for...in` keys are strings); `'"]'` → `""` in name/rel selectors (3, CSS closes the string and bracket at end of input); `element[0] === null` (2); `i < obj.length` (2, extra elements get `undefined`, which is skipped); checkbox `element.length > 0` → `>= 0` (1); `mobile: true` default (1) |
| On the select-by-key throw path (3)   | the array branch's `element[0].type` select operands: a select by key throws today, so only the `it.fails` tests reach them; the select fix makes them killable                                                                                                                                                                                                                                                                                                                                                         |

### Architecture review (Phase 3, 2026-11-11)

Scope: `src/jquery.loadJSON.js` and the UMD header in `rollup.config.mjs`. The test surface stays
`$.fn.loadJSON(data, options)`; no candidate changes a test. Lines refer to the source as of
`b04ff04`.

| Item | Opportunity                                                                                                                            | Line | Dead branches removed                                                                               | ESLint warnings removed                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A1   | Move the five inner functions out of the per-call closure; pass the outer argument as `data` where pinned behavior reads it            | 1.x  | none                                                                                                | none                                                                              |
| A2   | Element-kind module: `kindOf(element)` normalizes once, one function per kind, the walk calls only `setValue`                          | 1.x  | 13 of 14 (type sniff 5, `case 'select'` 1, multiple guard 3, link 1, image 3); the 14th comes alive | `no-prototype-builtins`, `no-redeclare` (`iPosition`), `no-useless-assignment` x2 |
| A3   | Key-match module: `match(key, $scope)` tries class, id, name, rel in order, one query per step                                         | 1.x  | none                                                                                                | none                                                                              |
| A4   | Element kinds say which value shapes they take whole (option: object; selects, checkboxes: array); the walk splits by value shape      | 1.x  | none counted (drops the always-false `element.type` checks)                                         | `no-redeclare` (`i`)                                                              |
| A5   | Legacy module: `installContains`, `refreshMobile`, `notice(id)` with the debug flag and message table; checkbox stops using `contains` | 1.x  | none                                                                                                | none                                                                              |
| A6   | Argument normalization: decide data or URL once, then one load path (template, callbacks, walk)                                        | 1.x  | none                                                                                                | none                                                                              |
| A7   | 2.0 follow-ons on the A2–A6 shapes (see Phase 6)                                                                                       | 2.0  | n/a                                                                                                 | n/a                                                                               |
| A8   | Move the UMD header out of `rollup.config.mjs`                                                                                         | No   | n/a                                                                                                 | n/a                                                                               |

Reasons and constraints:

- A1 first: the select and image bugs come from inner functions reading the call's `obj` through
  the closure. Naming it `data` keeps behavior and turns each fix into a one-token change.
- A2 holds 7 of the 1.x fixes (select x4, image x2, link fragment). The type-sniff, select and
  image dead branches only disappear with their fix, so the fix commit lands before the refactor.
  The `value.constructor == Array ? value : [value]` arm becomes live with the select fixes.
- A3 escaping rule: retry with the escaped key only when the raw selector throws. Retrying on a
  miss would make a dot key match its literal class whenever the compound selector misses, which is
  the dot-key fix deferred to 2.0. jQuery 1.7 misses instead of throwing, so the 1.x rule needs its
  own validity check, and `$.escapeSelector` (jQuery 3.0+) is unavailable on 1.7: use `CSS.escape`
  or a local escape. 2.0 (floor 3.5) uses `$.escapeSelector`.
- A4: #28 lands as wrapping the scope with `$()` once. It flips two tests: its `it.fails` and the
  pinned "should throw for an element that is not a select or form", which pins the same crash.
- A5 adds `$.fn.loadJSON.debug`, the one public addition 1.x makes (already decided). The message
  table is the source for `docs/migrating-to-2.md`.
- A6 is small; do it alongside A1 or last, not as its own project. The repeat's clone source,
  currently a local named `template`, is renamed: in `GLOSSARY.md` the template is the markup being
  filled and the saved template is the `loadJSON-template` copy.
- A8: the header is already one module with a small interface (ADR-0001's contract) and full
  surface-test coverage; moving it moves complexity without concentrating it. The CommonJS fix
  stays in the header: use `require('jquery/factory').jQueryFactory(root)` when present, else the
  jQuery 3 call.
- Rejected, no ADR needed: a DOM adapter seam over jQuery (one adapter, nothing varies across it);
  exposing kinds or match as public interface (widens the 1.x surface).

Deprecation notice sites (1.4, under `$.fn.loadJSON.debug`, once per page):

| 2.0 removal                             | Notice fires in                      | When                                                  |
| --------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `Array.prototype.contains`              | `installContains` (A5), at the entry | first install on the page                             |
| jQuery Mobile refresh hooks             | `refreshMobile` (A5)                 | `selectmenu` or `checkboxradio` exists on the element |
| `mobile` option                         | options merge at the entry (A6)      | `"mobile" in options`                                 |
| `src$alt` image string                  | image kind (A2)                      | a string value contains `$`                           |
| top-level image fallback                | image kind (A2)                      | the image took `src`/`alt`/`title` from the top level |
| `rel` key matching                      | rel step of match (A3)               | the rel step produced the match                       |
| `rel=index` array children              | array branch of the walk (A4)        | children with `rel` were found                        |
| URL string argument                     | argument normalization (A6)          | a string not starting with `{` or `[`                 |
| `.html()` by default (change, optional) | content kind (A2)                    | a string that looks like markup and `html` unset      |

Decisions (maintainer, 2026-11-11):

- Image: in 1.x an image takes its own value (a string as `src`, or `{src, alt, title}`); when the
  value is neither, it keeps today's top-level `src`/`alt`/`title` fallback, so the pinned test
  stays. 2.0 removes the fallback, announced by a 1.4 deprecation notice; added to the 2.0 list.
- Glossary: `GLOSSARY.md` records data, key, scope, match, repeat, template, saved template,
  element kind (field, checkbox, radio, option, select-one, select-multiple, link, image, content)
  and deprecation notice. "Key" replaces "binding key"; "template" keeps the README's sense (the
  markup being filled).
