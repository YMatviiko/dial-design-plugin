# DIAL page patterns

Page templates built from the latest DIAL Chat 2.0 Figma designs. Prototypes copy one
(`kit-lookup.mjs pattern <name> --source > page.tpl.html`), add the new feature in the template, and build it
(`kit-lookup.mjs pattern page.tpl.html > page.html`). Files starting with `_` are partials, included by patterns.

## Template syntax

| Marker | Becomes |
|---|---|
| `<!-- kit-link -->` | The kit stylesheet `<link>`, pinned to the installed version |
| `<!-- kit-grid -->` | The live kit Grid block (AG Grid + the kit's theme, `kit-lookup.mjs grid`). Put it in `<head>` after `kit-link`; then call `dialGrid()` from the page script |
| `<!-- include: navigation … -->` | The shared left navigation (options below) |
| `<!-- render: Name {"props":"json"} -->` | The real kit component, rendered now. One line |
| `<!-- wrap: Name {"props":"json"} -->` … `<!-- /wrap -->` | A kit component (Popup, SideDrawer, Card…) **around your markup**: the markup becomes its `children`, or the prop named by `"@slot"` (e.g. `{"@slot":"footer"}`). Nests; markers inside are expanded too |
| `<!-- icon: tabler-name 16\|20\|24 [classes] -->` | A Tabler icon (`-filled` for filled), coloured with a kit `text-*` class |
| `<!-- asset: name [height] -->` | An image from `assets/` (SVG or PNG) as an inline `<img>` |

In render props, `"@icon:name[:size]"` is a Tabler icon element and `"@asset:name"` is an asset's data URI (for
`src` / `iconUrl` props, e.g. `Avatar`, `EntityIdentity`). Handlers are added automatically; `"onBack": true` shows
a Back button, `"onX": null` hides a control. Inside `{"@component":"div", …}` a `"style"` string is kept.

Everything else is plain HTML with kit classes. Exact layout sizes from the design may be inline px
(`style="width: 336px"`); spacing and colours never.

## Navigation options

`<!-- include: navigation [collapsed] [active=ID] [chat=N] [chat-title="…"] [menu=N] [user=open] [item="Label|icon"] -->`

- `collapsed`: the 72px icon rail (builders, editors, task form/view) instead of the 336px sidebar.
- `active=new-chat|scheduled|catalog|files`: the current main page (tinted pill + `assets/nav-ID-active.svg`).
- `chat=N`: the open conversation row (rows 1–8 in `_navigation.html`); `chat-title="…"` renames it.
- `menu=N`: that row hovered with its "more" button (what the chat actions menu opens from).
- `user=open`: the footer user button pressed (the user menu is open).
- `item="Label|tabler-icon"`: adds a main nav item for a **new page** (after File manager); `active=item`
  highlights it. Use it when prototyping a new top-level page.

## Assets

Brand art and icons the kit doesn't ship, exported from Figma: `dial-chat-logo`, `dial-mark`, nav icons
(`nav-*`), gradient icons (`sparkles`), status/warning marks, model and provider logos (`model-gpt`,
`chat-model-*`, `catalog-icon-*`, `quickapp-model-*`), file-type icons (`files-*`, `file-pdf`, `file-code`), sample
images. Shared art has a plain name; area-specific art is prefixed with its area. Before adding one, check for an
existing file with the same art.

## Pattern header

Every pattern starts with:

```html
<!doctype html>
<!-- DIAL prototype — not production code -->
<!-- pattern-meta area="Catalog" layout="Browse list: …" checked-with-kit="0.16.4" -->
<!-- Pattern: … Source of truth: Figma "…" (file key), page "…", frame <id> "…". -->
```

`kit-lookup.mjs patterns` builds the pattern list from the `pattern-meta` line, so a new pattern needs no edit
anywhere else. `layout` says what the screen is **structurally** (both skills pick patterns by layout);
`checked-with-kit` is the kit version the pattern was last built and checked with.

## Rules for pattern markup

Patterns teach both skills, including the React one, so they must model the real components:
- every kit component is a `render` or `wrap` marker — never a hand-built copy of its look (a browse card is
  `<!-- wrap: CardShell {…} -->`, not an `<article>` with CardShell's classes). The validator fails a hand-built CardShell;
- static stand-ins (the markdown editor block, a static tooltip, hand-built tables) only where the kit component
  can't render statically, with a comment saying so.

## Adding or updating a pattern (maintainers)

Open the plugin repo in Claude Code: the `dial-pattern-maintainer` skill (repo-only, `.claude/skills/`) walks
through it: Figma frame → template → build → validate → screenshot compare → `node check-release.mjs`.
