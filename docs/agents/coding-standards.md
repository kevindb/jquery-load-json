# Coding standards

Agent-facing standards for changing this repo. Once tooling lands, **config and scripts win**:
ESLint, Prettier, `package.json` and CI encode these rules; look them up rather than restating them.

Human PR/process stays in `CONTRIBUTING.md`.

## Workshop

| Concern      | Target                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Runtime / CI | **Node 26** (`.nvmrc`); **GitHub Actions** runs `npm test`.                                                |
| Lint         | **ESLint** flat config: correctness and quality.                                                           |
| Format       | **Prettier** defaults with `printWidth: 100` and `trailingComma: "es5"`. No `.editorconfig`.               |
| Verify       | **`npm test`** is the one command agents run.                                                              |
| Tests        | Vitest browser mode (Playwright provider, v8 coverage); jQuery matrix on Chromium, Firefox and WebKit.     |
| Publish      | **Dual surface** (ADR-0001): module entry **and** classic UMD / script-tag `$.fn` build, both from Rollup. |
| Language     | Plain JavaScript.                                                                                          |

## Commits

**[Conventional Commits](https://www.conventionalcommits.org/)**, each message **1–3 lines** (subject
plus at most a short body). Use the type that matches the change (`fix`, `feat`, `docs`, `test`,
`chore`, `refactor`, `ci`, `build`). Omit `Co-authored-by` and similar trailers. Don't mix a behavior change and a refactor or format sweep in one
commit.

## Public text

Public text is anything a user of the library reads: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`,
`docs/` pages, comments in `src/` (they ship in `dist/`), GitHub release notes, and issue and PR
comments.

- Write it so it makes sense without `docs/plans/`, `docs/agents/` and `docs/adr/`.
- Don't mention plan phases, internal finding labels or `it.fails` records. Name the behavior, the
  version or the GitHub issue instead.
- Don't link to `docs/plans/`. An ADR link is fine where its reasoning helps a contributor.

## Tests

- **Names:** BDD style, behavior in plain language (`describe` / `it`): "when X, it should Y".
- **Shape:** **AAA** in each example: Arrange, Act, Assert as distinct steps (blank line between).
- A known bug is an `it.fails` test of the intended behavior; the fix flips it to `it`.

## When changing code

1. Read this doc and the configs it points at.
2. Edit **`src/`**, never `dist/` (generated, but committed; CI checks it matches a build).
3. Preserve the classic `$.fn` surface and the module entry (ADR-0001).
4. Add or update tests with BDD names and AAA shape when behavior changes.
5. Run **`npm test`**. Done when it passes.
6. Commit with Conventional Commits, 1–3 lines.
