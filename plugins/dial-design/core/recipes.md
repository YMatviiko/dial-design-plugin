# Component recipes

Shared by both DIAL skills. Props are written as JSON, which is exactly what the HTML skill passes to
`kit-lookup.mjs render`, and maps one-to-one to JSX props in React:

| JSON (render / pattern marker) | JSX |
|---|---|
| `{"label":"Save","disabled":true}` | `label="Save" disabled` |
| `{"variant":"filled"}` (enum string value) | the exported enum: `variant={BadgeVariant.Filled}`. `info` names the enum type (`variant: BadgeVariant = "outlined" \| "filled"`) and its examples use it |
| `"@icon:plus"`, `"@icon:x:16"` | `<IconPlus size={20} stroke={1.5} />`, `<IconX size={16} stroke={1.5} />` from `@tabler/icons-react` |
| `{"@component":"Badge","label":"New"}` | `<Badge label="New" />` |
| `{"@component":"div","className":"flex gap-2","children":[…]}` | `<div className="flex gap-2">…</div>` |
| `"@asset:model-gpt"` | the project's own image/icon for that entity |
| `"onBack": true` / `"onX": null` | pass a handler / leave the prop out |

Always confirm props with `kit-lookup.mjs info <Name>`: it lists them with enum values and the kit's own examples.

| Want | Component and props |
|---|---|
| Primary / neutral / outlined / ghost / link / danger button | `PrimaryButton` `NeutralButton` `OutlinedButton` `GhostButton` `LinkButton` `DangerButton` with `{"label":"…"}` |
| Button with icon | `PrimaryButton {"label":"New","iconBefore":"@icon:plus"}` |
| Icon-only button | `PrimaryIconButton` / `GhostIconButton` / `DangerIconButton` `{"aria-label":"Send","icon":"@icon:send"}`; `"size":"small"` for 24px |
| Text field | `Input {"id":"name","labelProps":{"label":"Name"},"placeholder":"…"}`; `"invalid":true,"error":"…"` or `"disabled":true` |
| Search | `Search {"placeholder":"Search applications"}`; `"size":"large"` in a page toolbar |
| **Search results** | Wrap every searched text (names, descriptions) in **`Highlight {"text":"…","query":"…","maxLines":2}`** so matches are marked, as in the catalog; no matches → `NoDataContent` |
| **Sort control** | **`GhostButton {"label":"<current sort>","iconBefore":"@icon:arrows-sort","iconAfter":"@icon:chevron-down"}`** as the trigger of a **`Dropdown`** whose items are the sort options with `mark: MenuItemMark.Check` and `checked` on the current one. Not `InlineSelect` or `Select`: they can't show the sort icon the design has |
| Select | `Select {"id":"m","labelProps":{"label":"Model"},"options":[{"value":"a","label":"GPT-4o"}],"value":"a"}` |
| Checkbox / Switch / Radio | `Checkbox {"id":"c","labelProps":{"label":"…"},"isSelected":true}`, `Switch {…,"isOn":true}`, `Radio {"id":"r","name":"g","value":"m","labelProps":{"label":"…"},"isSelected":true}` |
| Tabs | `Tabs {"ariaLabel":"…","tabs":[{"id":"a","label":"Models","count":12}],"activeTabId":"a"}` |
| Tag / chip | `Tag {"label":"…"}`; `"closable":true`; `"appearance":"selectable","selected":true`; on/off filter: `ToggleChip`; pick-one row: `FilterChips` |
| Status / schedule label | `Badge {"label":"Active"}`; `"variant":"filled","color":"blue"` for a count; `"icon":"@icon:check:12"`. `textClassName` **replaces** the label's type class (outlined: `dial-tiny-text`, filled: `dial-caption-lead-semi-text`), so to truncate pass `"dial-tiny-text truncate"`, never just `"truncate"` |
| Inline alert | `Notification {"variant":"info","type":"section-message","title":"…","message":"…"}` |
| **Card in a browse grid** | **`CardShell`** around the card content; `"className":"flex-row items-center"` for a compact card |
| Entity identity (icon, type, name, version) | `EntityIdentity {"item":{"type":"toolset","name":"…","version":"1.0.0"},"labels":{"type":"Toolset"},"iconSize":48}` |
| Folder path / breadcrumbs | `FolderPath {"segments":["Public","OpenAI"]}` (read-only); `Breadcrumbs` (navigable) |
| Person / entity picture | `Avatar {"name":"GPT-4o","size":28}` |
| Form section | `FormSection {"title":"Model","description":"…"}` around the fields |
| Selected model / agent in a form | `SelectedEntityCard` |
| Empty list / no results | `NoDataContent {"title":"…","description":"…"}` |
| Markdown / instructions editor | `MarkdownEditor` (the HTML skill copies a static stand-in from `scheduled-task-form`) |
| Modal / confirm dialog | `Popup {"open":true,"header":"…","size":"sm"}`; `ConfirmationPopup {"open":true,"header":"…","description":"…","variant":"danger","confirmLabel":"Delete"}` |
| Details / move panel | `SideDrawer` (540px) |
| Data table | `Grid` (AG Grid with the kit theme): `columnDefs`, `rowData`, `selection` |
| Tooltip | `Tooltip` around the trigger |
| Steps of a flow | `Steps` |
| Theme choice (light / dark / system) in settings | `Select` with Light, Dark, System, as in the `settings` pattern; wired to the app's theme (`useDialTheme().setMode` with the recipe in `themes.md`) |
| A panel in a different theme than the page | redefine the tokens with a class on its root and wrap it in `ThemeScope {"className":"…"}` so its overlays follow |

Anything else: `search`, then `info`. **Search before hand-building anything**: every kit release adds
components (0.15: `Badge`, `Avatar`, `SideDrawer`, `BottomSheet`; 0.16: `ToggleChip`, `FormSection`,
`SelectedEntityCard`, `LoginScreen`). Only 2.0 components: `search` marks a 1.0 (`Dial*`) one and names its
replacement.
