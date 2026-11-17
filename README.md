# DIAL Design (Claude Code plugin)

Two Claude Code skills for building UI with `@epam/ai-dial-ui-kit` (design system 2.0), sharing one core:

| Skill | For | Output |
|---|---|---|
| **dial-design-vibecode** | Engineers building real features | React/TSX code in the project, using kit components, validated before every diff and commit |
| **dial-html-prototype** | Designers, PMs, anyone sketching an idea | One self-contained `.html` file in DIAL 2.0 styling, built from the real kit components |

Both start every screen from the closest **DIAL page pattern** (23 screens from the DIAL Chat 2.0 Figma files:
chat, catalog, toolsets, QuickApp, scheduled tasks, file manager, settings, tables), use only real 2.0 kit
components (a card is `CardShell`, never a copy of its look), and fail a validator on made-up classes, legacy tokens
and hand-built components.

## Install

Once per computer (needs Claude Code, Node 18+ and access to `@epam/ai-dial-ui-kit` on npm):

```
claude plugin marketplace add <owner>/<repo>
claude plugin install dial-design@dial-design
```

Restart Claude Code. Then just describe the job:
- "Add a page that lists our evaluation runs" (in a React project) → dial-design-vibecode
- "Make a prototype of a new agent permissions screen" → dial-html-prototype

No MCP server and no restart after setup are needed: the skills read the kit installed in the project (or, for
prototypes, install the newest one into the prototype folder).

## Update

```
claude plugin marketplace update dial-design
```

Then restart Claude Code. Or turn on auto-update for the marketplace in `/plugin`. Each skill prints its version
when it starts, so bug reports name it.

## How the kit version is chosen

- **Prototypes** always use the newest kit: every run upgrades the prototype folder's kit and pins the stylesheet to
  that exact version.
- **React projects** use the kit version in the project's `package.json` (code can only use components the project
  has). The skill checks npm once per session and, if a newer kit exists, says which components it adds. It never
  upgrades without asking.

## What's inside

```
plugins/dial-design/
  core/                         shared by both skills
    kit-lookup.mjs              reads the installed kit: search, info, type, classes, patterns, status (+ render for HTML)
    kit-rules.mjs               shared validator rules
    foundations.md              colour tokens, typography, pairings
    layouts.md                  DIAL screen rules and how to pick a pattern
    recipes.md                  which component for what
    patterns/                   page templates (from Figma) + assets
  skills/dial-design-vibecode/  React skill: SKILL.md, react.md, validate.mjs
  skills/dial-html-prototype/   HTML skill: SKILL.md, html.md, validate-html.mjs
.claude/skills/dial-pattern-maintainer/   maintainers only (loads when you work in this repo)
check-release.mjs               release check (patterns, rules, docs vs the newest kit)
```

## Maintainers

Open this repo in Claude Code and describe the change ("update the catalog pattern from <Figma link>", "kit 0.17 is
out", "release the plugin"); the `dial-pattern-maintainer` skill has the steps. In short:

| Change | What to do |
|---|---|
| New/changed kit component | Nothing — both skills read components at runtime |
| Screen redesigned / new screen | Update or add a pattern from the Figma frame |
| New "always use component X" rule | Add it to `core/kit-rules.mjs` |
| New kit release | `node check-release.mjs`; fix what fails |

Release: `node check-release.mjs` must print `OK` → bump the version in `plugin.json` and `marketplace.json` → add a
`CHANGELOG.md` entry → commit, tag, push. A weekly GitHub Action runs the same check against the newest kit and opens
an issue when a kit release breaks something.
