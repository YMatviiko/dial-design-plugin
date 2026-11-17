# Reading a DIAL pattern as React

The patterns in `<core>/patterns/` are HTML templates, but every kit component in them is a **marker that names
the real component and its props**. So a template is a precise layout spec for React: which components, with
which props, in which kit-class layout. Get one with:

```
node "<core>/kit-lookup.mjs" pattern <name> --source
```

Read the template (`--source`), never a built page: the built page has the components expanded into their HTML,
which is exactly what you must **not** copy into JSX.

## Marker → JSX

| In the template | In React |
|---|---|
| `<!-- render: Name {"label":"Save","iconBefore":"@icon:plus"} -->` | `<Name label="Save" iconBefore={<IconPlus size={20} stroke={1.5} />} />` |
| `<!-- wrap: Name {props} --> …markup… <!-- /wrap -->` | `<Name {...props}>…markup as JSX…</Name>`; with `"@slot":"footer"` the markup goes into that prop: `footer={…}` |
| `{"@component":"Badge","label":"New"}` inside props | `<Badge label="New" />` |
| `{"@component":"div","className":"…","children":[…]}` | `<div className="…">…</div>` |
| Enum string values (`"variant":"filled"`) | the kit enum: `variant={BadgeVariant.Filled}` (`kit-lookup.mjs info Badge` names it) |
| `"@icon:name:16"` / `<!-- icon: name 16 text-secondary -->` | `<IconName size={16} stroke={1.5} className="text-secondary" />` from `@tabler/icons-react` (the kit's icon set). It comes in as the kit's dependency; if the project's `package.json` doesn't list it, add it (`npm install @tabler/icons-react`) and mention it |
| `<!-- asset: name -->`, `"@asset:name"` | the project's own image for that entity (model/provider logos are data, not design) |
| `<!-- include: navigation … -->` | the project's **existing** app shell/navigation. Only if the project has none, build it as `<core>/layouts.md` describes |
| `class="flex items-center gap-2"` | `className="flex items-center gap-2"` — same kit classes |
| `style="width: 336px"` (a layout size) | a kit class if one exists (`kit-lookup.mjs classes 'w-\[336px\]'`), else a numeric layout size: `style={{ width: 336 }}`. Never spacing or colour |
| `<!-- kit-grid -->` + `dialGrid('#id', {…})` | `<Grid columnDefs={…} rowData={…} selection="multiple" />` — the options mirror the kit Grid's props |
| `onClick` handlers implied by markers | real handlers |
| The sort `GhostButton` (`arrows-sort` + chevron) in a toolbar | the trigger of a `Dropdown`: sort options as items, `mark: MenuItemMark.Check`, `checked` on the current one; the button label is the current sort |
| Card/row text in a list that has a `Search` | `<Highlight text={…} query={query} maxLines={…} />` instead of plain text (replaces `line-clamp-*`), so matches are marked |

## Theme: what the template's theme block becomes

Every template has `<!-- kit-theme -->` (the DIAL light/dark values + a toggle for the static page). In React it
becomes nothing in the page: the app applies the theme (DIAL Chat does; a standalone app uses the recipe in
`<core>/themes.md`). Asset pairs (`data-theme-only="light"` / `"dark"`) become one themed image:
`image('chat-logo')` from `useDialTheme()`, or the app's own theme context. Kit token classes need no change.

## Static stand-ins: don't port them

Some template parts exist only because a static page can't run React. In React use the real component:

| In the template | In React |
|---|---|
| Static `MarkdownEditor` block (toolbar + monospace text) | `MarkdownEditor` |
| `<div role="tooltip" …bg-control-inverted…>` | `Tooltip` around the trigger |
| A `Popup` / `SideDrawer` squeezed into a section (`absolute inset-0`) | the component at page level, opened by state |
| Hand-built `<table>` from the `tables` pattern | `Grid`; only if the Grid truly can't draw that layout, a table with kit classes, and say so |
| Status pills built from the Tag shape | `Badge` |
| `data-dial-component="…"` attributes | drop them; the component itself is the tag |
| Inline `<script>` click-through | component state |

The validator fails the common slips: a class string with CardShell's look, a backdrop (`bg-backdrop`), a tooltip
surface (`bg-control-inverted`), a filled accent control outside `PrimaryButton`, or a kit-internal `dial-kit-*`
class.

## Example: a scheduled-task card

Template (`scheduled-tasks`):

```html
<div class="flex flex-col" style="min-height: 184px"><!-- render: CardShell {"className":"flex-1","children":[
  {"@component":"div","className":"flex w-full items-start gap-2","children":[
    {"@component":"h3","className":"flex-1 min-w-0 dial-body-semi-text text-primary","children":"Urgent Issues Summary"},
    {"@component":"Badge","label":"8 new","variant":"filled","color":"blue"}]},
  {"@component":"p","className":"flex-1 min-h-0 dial-small-paragraph-text text-secondary line-clamp-3","children":"Summarize high-priority customer tickets."},
  {"@component":"Badge","label":"Hourly, 8 min past the hour"}]} --></div>
```

React:

```tsx
import { Badge, BadgeColor, BadgeVariant, CardShell, Highlight } from '@epam/ai-dial-ui-kit';

// query = the page's search text ('' when empty), so matches are highlighted
export const TaskCard = ({ task, query }: { task: Task; query: string }) => (
  <div className="flex flex-col" style={{ minHeight: 184 }}>
    <CardShell className="flex-1">
      <div className="flex w-full items-start gap-2">
        <h3 className="flex-1 min-w-0 dial-body-semi-text text-primary">
          <Highlight text={task.title} query={query} maxLines={2} />
        </h3>
        {task.newRuns > 0 && (
          <Badge label={`${task.newRuns} new`} variant={BadgeVariant.Filled} color={BadgeColor.Blue} />
        )}
      </div>
      <div className="flex-1 min-h-0 dial-small-paragraph-text text-secondary">
        <Highlight text={task.description} query={query} maxLines={3} />
      </div>
      <Badge label={task.scheduleLabel} />
    </CardShell>
  </div>
);
```

Check every prop name and enum with `kit-lookup.mjs info <Name>` (and the fields of object-typed props, e.g. `Dropdown` items,
with `kit-lookup.mjs type DropdownItem`) before writing it; the kit's own examples there
show the exact import names.
