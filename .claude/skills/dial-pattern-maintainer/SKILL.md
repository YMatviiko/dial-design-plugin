---
name: dial-pattern-maintainer
description: Maintain the dial-design plugin in this repo — add or update a DIAL page pattern from a Figma frame, add a hand-built-component rule, react to a new @epam/ai-dial-ui-kit release, and cut a plugin release. Use when the user gives a Figma link for a pattern, says the design changed, asks to add a screen/pattern, says a new kit version is out, or asks to release the plugin.
---

# Maintaining the dial-design plugin

Repo layout:

```
plugins/dial-design/
  core/                      shared by both skills
    kit-lookup.mjs           reads the kit (search/info/classes/patterns/status + render/pattern build/grid)
    kit-rules.mjs            shared validator rules: unknown class, legacy token, hand-built components
    foundations.md layouts.md recipes.md
    patterns/*.html          page templates (+ _partials), README.md has the syntax
    assets/                  brand art exported from Figma
  skills/dial-html-prototype/   SKILL.md, html.md, validate-html.mjs
  skills/dial-design-vibecode/  SKILL.md, react.md, validate.mjs
check-release.mjs            must print OK before a release
CHANGELOG.md                 one entry per release
```

Work in a scratch folder with the kit installed (`mkdir -p /tmp/dial-work && cd /tmp/dial-work && node
<repo>/plugins/dial-design/core/kit-lookup.mjs update`). `K` = `node <repo>/plugins/dial-design/core/kit-lookup.mjs`.

## What needs a change, by kind of update

| Change | Do |
|---|---|
| New/changed kit component | Nothing: both skills read components at runtime. If it replaces something a pattern hand-builds or stands in for statically, swap it into that pattern; if it's a common need, add a row to `core/recipes.md` |
| Tokens/typography renamed in the kit | `check-release.mjs` names the doc line; fix it in `core/foundations.md` |
| Existing screen redesigned in Figma | Update the pattern (below) |
| New screen or area | Add a pattern (below) |
| A new "never hand-build X" rule | Add an entry to `HAND_BUILT` in `core/kit-rules.mjs` (below) |
| New kit release | `node check-release.mjs`; fix what fails; bump `checked-with-kit` |

## Add or update a pattern from Figma

1. Get the Figma frame (link with `node-id`). Use the Figma MCP tools if connected (screenshot + design context of the
   frame); otherwise ask for a screenshot and the values you need. Take the **latest iteration** page; pick frames that
   define the layout (main screen + key states/dialogs), skip hover duplicates.
2. Start from the closest existing pattern (`K pattern <name> --source`), or from the skeleton in
   `skills/dial-html-prototype/html.md` for a new area.
3. Map Figma values to kit classes (`text&icon/secondary` → `text-secondary`, `background/layer-raised` →
   `bg-layer-raised`, `stroke/tertiary` → `border-tertiary`, type styles → `dial-*-text`, shadows → `shadow-sm|md|lg`).
   Check every class with `K classes`.
4. **Every kit component is a `render` or `wrap` marker** (`K search` first — with several words). A browse card is
   `<!-- wrap: CardShell {"className":"…"} -->`; never write a component's classes onto your own element. Patterns teach
   the React skill too: whatever a pattern hand-builds, engineers will hand-build.
5. Export gradient icons, logos and other non-token art into `core/assets/` (check for an existing file with the same
   art first; area-specific art is prefixed with the area).
6. Header, right after the prototype label:
   `<!-- pattern-meta area="…" layout="<structure, in words both skills can match a new feature against>" checked-with-kit="<kit version>" -->`,
   then a comment naming the Figma file key, page and frame id.
7. Build and validate:
   ```
   K pattern <name> > /tmp/dial-work/<name>.html
   node <repo>/plugins/dial-design/skills/dial-html-prototype/validate-html.mjs /tmp/dial-work/<name>.html
   ```
8. Screenshot at 1440×900 (and 1920×1080 if the frame is that size) and compare side by side with the Figma screenshot
   until it matches. Show the user both images and get their approval before going on.
9. If the pattern changes a layout rule (nav width, gutters, drawer width, card anatomy), update `core/layouts.md` too.

## Add a hand-built-component rule

In `core/kit-rules.mjs`, `HAND_BUILT`: `component`, `scope` (`both`, or `react` when the HTML skill has a sanctioned
static stand-in), `look` (classes that together are that component's appearance — strings or RegExps), `marker` (a
class only the real rendered component carries, so rendered markup in prototypes doesn't trip it; `null` for
react-only rules), `why` (the fix, shown to the agent). Then:
- `K render <Component> '{"children":"x"}'` and confirm the look + marker classes are in its root;
- add a bad and a good `.tsx` example to a scratch project and run `skills/dial-design-vibecode/validate.mjs <files>`;
- build all patterns and validate them (`check-release.mjs` does both) — no pattern may trip the new rule.

## Release

1. `node check-release.mjs` (add `--screenshots /tmp/dial-shots` to review every pattern). Must print `OK`.
2. Bump `version` in `plugins/dial-design/.claude-plugin/plugin.json` **and** `.claude-plugin/marketplace.json`
   (patch = wording/pattern fix · minor = new pattern, rule or command · major = a validator change that can block
   work that passed before).
3. Add a `## x.y.z — date` entry at the top of `CHANGELOG.md`: what changed, which kit version it was checked with.
4. Commit, tag `vX.Y.Z`, push (check-release prints the commands). Users get it with
   `claude plugin marketplace update dial-design` (or auto-update) and a restart.
