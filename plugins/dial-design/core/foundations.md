# DIAL 2.0 foundations: colour, type, pairings

Shared by both DIAL skills. True in plain HTML and in React: these are kit utility classes, used in `class=""` or
`className=""`. Check any class with `kit-lookup.mjs classes '<regex>'`.

## Colour tokens (2.0)

Each is `<prefix>-<name>`. Light values shown for orientation only; never type them.

| Role | Class | Light value |
|---|---|---|
| Page background | `bg-layer-base` | #F5F7FA |
| Card / panel / popup / input surface | `bg-layer-raised` | #FCFCFC |
| Inset area, zebra rows, disabled fields, count badges | `bg-layer-sunken` | #EEF1F7 |
| Modal backdrop (comes with Popup / SideDrawer; don't paint it yourself) | `bg-backdrop` | #161B2D at 30% |
| Main text | `text-primary` | #161B2D |
| Secondary text, labels, hints, captions, icons | `text-secondary` | #57647A |
| Accent text, links, selected items | `text-accent` | #1D4ED8 |
| Status text | `text-error` `text-success` `text-warning` `text-info` | |
| Text on a filled accent/danger control | `text-control-permanent` | #FCFCFC |
| Text on `bg-control-inverted` (tooltip only) | `text-control-inverted` | #FCFCFC |
| Filled accent control | `bg-control-accent` | #1D4ED8 |
| Soft accent tint (selected row/item) | `bg-control-accent-alpha` | |
| Hover tint | `hover:bg-control-accent-alpha-hover` | |
| Status backgrounds | `bg-info` `bg-success` `bg-warning` `bg-error` | |
| Dividers, table lines, panel borders | `border-tertiary` | #E0E6F0 |
| Field borders | `border-secondary` | #D1DBEA |
| Outlined control border | `border-default` | #B2C2DD |
| Accent border (selected, highlighted) | `border-accent` | #1D4ED8 |
| Strong border (rare; not for fields) | `border-primary` | #57647A |

Entity/type colours (catalog type labels, avatar tints) use the kit palette pairs, e.g. `bg-blue text-blue`,
`bg-violet-1 text-violet-2`, `bg-green-1 text-green-2` — see the `catalog` pattern. Prefer the component that
draws them (`EntityIdentity`, `Avatar`, `Badge`) over painting them yourself.

## Pairings

- Text on a filled control is `text-control-permanent`; `text-control-inverted` only goes on `bg-control-inverted`.
- Field borders are `border-secondary`, dividers `border-tertiary`.
- A default `Tag` / `Badge` is invisible on a raised card of the same colour: check it on `bg-layer-raised`.
- The blue→violet gradient only comes with the primary button (use `PrimaryButton`); there's no gradient utility.

## Don't use: legacy 1.0 tokens

Still in the kit CSS for old components; both validators fail on them:
`bg-layer-0…4`, `bg-accent-*`, `bg-controls-*`, `text-accent-primary`, `text-controls-*`, `border-accent-primary`.
There is no `text-tertiary` from kit 0.16 on: hints and captions are `text-secondary`, as in the kit's own components.

## Typography

One `dial-*-text` class sets size, line height and weight. The font is Inter.

| Use | Class |
|---|---|
| Page title | `dial-display3-text` (22/32) or `dial-h1-text` (20/28) |
| Section title | `dial-h1-text`; smaller `dial-h2-text` (18/26), `dial-h3-text` (16/24) |
| Card title | `dial-h3-text` or `dial-body-semi-text` (16/24) |
| Body | `dial-small-text` (14/20); long text `dial-small-paragraph-text` (14/24); large `dial-body-text` (16/24) |
| Emphasis | `dial-small-semi-text`, `dial-small-paragraph-semi-text` |
| Label, meta | `dial-tiny-semi-text`, `dial-tiny-text` (12/16) |
| Overline (uppercase) | `dial-tiny-lead-semi-text`, `dial-caption-lead-semi-text` |
| Code | `dial-code-text` |

## Raw values

Never a hex, `rgb()`, named colour, or a px/rem spacing value. One exception in both skills: an exact **layout
size** from the design (width, height and their min/max, e.g. the 336px sidebar) may be px when the kit has no
class for it. Spacing and colour never are.
