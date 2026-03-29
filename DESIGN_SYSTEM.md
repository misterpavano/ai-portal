# DESIGN_SYSTEM.md — AI Portal (Hedgehox / Kalabria)

_Established Sprint 7. All UI changes must reference this file._

---

## Identity

**Product:** AI-powered document review and transcription suite for agency teams
**Tone:** Professional, warm, confident. Not cold SaaS. Not playful startup.
**Aesthetic direction:** Editorial utility — clean density with warmth. Think Notion meets Linear meets a well-designed medical review tool.

---

## Typography

**Primary:** Plus Jakarta Sans (Google Fonts)
- Display/headings: 700-800 weight, tight tracking (-0.02em)
- Body: 400-500 weight, 14px base
- Labels/meta: 600 weight, 11-12px, uppercase tracking (0.08-0.12em) for section labels
- Monospace (code/technical): SF Mono, Consolas

**Hierarchy rules:**
- Page titles: 20-24px, 800 weight
- Section headers: 15-16px, 700 weight
- Card headers: 13px, 600 weight, uppercase
- Body text: 13-14px, 400-500 weight
- Meta/labels: 11-12px, 500-600 weight

**DO NOT USE:** Inter, Roboto, Arial, Open Sans as primary anywhere.

---

## Color

### Core Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `coral-400` | #E86D5A | Primary accent, active states, CTAs |
| `coral-500` | #D4553F | Hover/pressed accent |
| `coral-50` | #FEF2F0 | Accent backgrounds (selected cards, active pills) |
| `coral-100` | #FECDC6 | Accent borders (light) |
| `charcoal-900` | #1C1917 | Primary text, toolbar bg, dark UI |
| `charcoal-950` | #0C0A09 | Sidebar bg |
| `charcoal-600` | #44403C | Secondary text |
| `charcoal-400` | #78716C | Tertiary text, placeholders |
| `charcoal-300` | #A8A29E | Muted text, disabled |
| `stone-200` | #E7E5E4 | Borders, dividers |
| `stone-100` | #F5F5F4 | Subtle backgrounds |
| `stone-50` | #FAFAF9 | Card/input backgrounds |
| `white` | #FFFFFF | Content backgrounds |
| `green-600` | #3D9A5C | Success, approved |
| `red-500` | #DC5E5E | Error, rejected |

### Rules
- **No pure black (#000) or pure white (#FFF)** — always use charcoal-900 and #FFFFFF
- **Tint neutrals warm** — use the stone scale, not gray
- **Coral is the ONLY accent** — no blue, no purple, no teal
- **Dark UI elements** (toolbar, sidebar header) always charcoal-900

---

## Spacing

**Base unit:** 8px (MUI spacing: 1 = 8px)

| Context | Value |
|---------|-------|
| Page padding | 20-24px (2.5-3 units) |
| Section gap | 24-32px (3-4 units) |
| Card padding | 16px (2 units) |
| Card gap | 12px (1.5 units) |
| Element gap (inline) | 8-12px (1-1.5 units) |
| Tight gap (pills, badges) | 4-6px (0.5-0.75 units) |

**Rule:** Spacing should create rhythm. Tighter within groups, more generous between sections.

---

## Border Radius

| Element | Radius |
|---------|--------|
| Cards, panels, modals | 10-12px |
| Buttons, inputs, pills | 8-10px |
| Badges, tags | 6px |
| Avatars, severity dots | 50% |
| Icon containers | 10px |

**Rule:** 10px is the default. Use 8px for small elements, 12px for prominent containers.

---

## Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Default flat |
| 1 | 0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04) | Cards, panels |
| 2 | 0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04) | Expanded cards, popovers |
| 3 | 0 8px 24px rgba(28,25,23,0.12), 0 4px 8px rgba(28,25,23,0.06) | Modals, dropdowns |

**Rule:** Shadows use warm charcoal tint, NOT pure black.

---

## Components

### Buttons
- **Primary:** coral-400 bg, white text, 8-10px radius, 600 weight
- **Secondary:** white bg, charcoal border (#E7E5E4), charcoal text, hover: stone-50 bg
- **Ghost:** transparent bg, coral text, hover: coral-50 bg
- **Disabled:** 50% opacity or muted bg

### Cards (OptionCard)
- 1.5px border, stone-200 default, coral-400 when checked
- 10-12px radius
- Icon container: 40px square, 10px radius, stone-100 bg (coral when checked)

### Inputs
- 1.5px border, stone-200
- 10px radius
- stone-50 background
- Coral focus ring (1.5px border-color: coral-400)

### Toolbars
- charcoal-900 background
- White text
- 10px radius
- Coral accent buttons

### Sidebar panels
- charcoal-900 header
- White body
- stone-200 borders
- 10px radius

---

## Transitions

- **Default:** 0.15s ease
- **Hover states:** color, background-color, border-color (0.15s)
- **Expanding content:** opacity 0.15s ease-in-out
- **Page transitions:** opacity + translateY, 0.18s ease-out

**Rule:** No bounce or elastic easing. Smooth deceleration only.

---

## Responsive Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| xs | 0-599px | Stack to single column |
| sm | 600-899px | Compact layouts |
| md | 900-1199px | Two-column splits engage |
| lg | 1200-1440px | Full layout |

---

## Icons

- **Library:** Tabler Icons (@tabler/icons-react)
- **Size:** 16-18px in UI, 24px for hero/empty states
- **Stroke:** 1.5 default
- **Color:** Follow text color hierarchy (charcoal-900/600/400)

**DO NOT:** Use emojis as UI icons. Use MUI icons only where Tabler doesn't have an equivalent.

---

## Anti-Patterns (BANNED)

- Cards inside cards
- Purple gradients
- Blue SaaS palettes
- Inter/Roboto as primary font
- Generic 3-column feature grids
- Pure black (#000) or pure white (#FFF)
- `height: "4px"` with `padding: "20px"` (conflicting sizing)
- Inline styles mixed with sx props inconsistently
- `neutral.300`, `neutral.400` etc. without checking actual rendered color on background

---

_Created Sprint 7. Update when adding new components or patterns._
