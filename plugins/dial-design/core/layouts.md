# DIAL screen layouts

Shared by both DIAL skills. People use these skills to build **new features** without a design, so never invent
the app around the feature: start from the closest page pattern and add the feature to it. The patterns are
built from the latest DIAL Chat 2.0 Figma designs and use real kit components everywhere a component exists.

## Pick a pattern

```
node <core>/kit-lookup.mjs patterns                 # every pattern: area, name, layout
node <core>/kit-lookup.mjs pattern <name> --source  # its template: the reference layout
```

Pick by **layout**, not by name:
- a new list or browse page of things → `scheduled-tasks` or `catalog` (CardShell grid);
- a create/edit form → `toolsets-editor`, `scheduled-task-form`, or `quickapp-builder` for a builder;
- details of one item → `catalog-details` / `toolsets-details` (side drawer) or `scheduled-task-view` (page);
- preferences, permissions, integrations → `settings`, `settings-extensions`;
- anything inside a conversation → `chat-conversation` + blocks from `chat-content`;
- a table → `tables` (the live kit Grid first; the static tables only for layouts the Grid doesn't draw);
- a destructive confirmation → `catalog-delete`; a picker → `quickapp-add-skill`.

If nothing fits, say so, build from these rules, and list the screen as approximate.

## What every DIAL screen keeps

- **Navigation**: the shared sidebar (336px, `bg-layer-raised`, no border) or, on builders, editors and forms, the
  72px icon rail. The current page or conversation is a tinted pill (`bg-control-accent-alpha`). A new top-level page
  adds one item to it; it never gets a different nav.
- **No header bar** above the content. A page starts with a heading row: title (`dial-h1-text` or
  `dial-display3-text`) + description in `text-secondary` on the left, the primary action (`PrimaryButton`, often with
  a `plus` icon) on the right.
- **Gutters**: content has 32px side gutters; browse grids are centred, max ~1116px, 3 columns, 20px gaps (`gap-5`).
- **Cards in a browse grid are `CardShell`** — always. Change its layout with `className` (`"flex-row items-center"`
  for a compact horizontal card, `"flex-1"` to fill a fixed-height cell); never copy its look (`rounded-[20px] p-5
  bg-layer-raised shadow-md`) onto your own element. Both validators fail on that. Inside: title row
  (`dial-body-semi-text` or `dial-h3-text`, optional `Badge`), description (`dial-small-paragraph-text text-secondary`,
  `line-clamp-2/3`), meta at the bottom (`Badge`, `FolderPath`, `EntityIdentity` at the top for catalog entities).
- **Toolbar** under the heading: a full-width `Search` (`size: "large"`) + the sort control (a `GhostButton` with the
  `arrows-sort` icon, the current sort as its label and a chevron, opening a `Dropdown` with a check on the current
  option) + filters (`OutlinedButton` with a chevron); `Tabs` with counts when the list has types.
- **Search results highlight the match**: searched text on cards and rows (names, descriptions) is rendered with
  `Highlight` (`text` + `query`), as in the catalog. No results → `NoDataContent`.
- **Overlays**: details and moves open as a 540px `SideDrawer`; confirmations (`ConfirmationPopup`) and pickers
  (`Popup`) as popups. Settings is a large `Popup` over the app.
- **Forms**: sections are `FormSection` (title, optional action and description); fields are kit `Input`,
  `Select`, `Textarea`, `Switch`, `RadioGroup`…; a selected model/agent is `SelectedEntityCard`. Editors split into a
  metadata column and a configuration column.
- **Empty states**: `NoDataContent`, never a hand-made message block.
- **Light and dark**: every screen works in both (`<core>/themes.md`): kit token classes only, logos in both versions,
  no styles picked by theme.
- **Chat**: no header bar. Composer = one card with the text line on top and `+`, model picker and mic (send once
  filled) below; 700px on the start screen, 748px in a conversation, pinned at the bottom. User message right-aligned
  in a tinted bubble (`bg-layer-sunken`) with edit/delete under it; assistant answer with the model icon and rich
  text, actions under it.

## Plain layout (only where no 2.0 component exists)

Search first (`kit-lookup.mjs search <word>`; newer kits keep adding components). What is left is plain layout from
kit classes, untagged:

- **Panel** (a static section in a form or builder, not a browse card): `rounded-[20px] p-6 bg-layer-raised shadow-md`
  or `rounded-xl border border-tertiary bg-layer-raised p-4`. It has no hover lift; that is the difference from
  `CardShell`.
- **Navigation / list row**: `flex w-full items-center gap-2 px-3 h-[40px] rounded-lg dial-small-text text-primary
  truncate hover:bg-control-accent-alpha-hover`; active row **replaces** `text-primary` with `text-accent` and adds
  `bg-control-accent-alpha`. Group heading: `px-3 pt-3 pb-1 dial-tiny-lead-semi-text text-secondary`.
- **Buttons in a column** stretch to full width (they are `display: flex`): put them in a row
  (`flex items-center gap-2`) or give the column `items-start`.
