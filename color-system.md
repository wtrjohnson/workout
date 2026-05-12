# Color System — Workout App

## Overview
The app uses a **light theme by default** (`color-scheme: light`) with semantic color tokens defined in `tailwind.config.ts`. A special `.workout-surface` CSS class switches the workout logger to a dark experience.

---

## Neutral Foundation Tokens (`tailwind.config.ts`)
| Token | Value | Usage |
|---|---|---|
| `surface` | `#f5f5f7` | Main page background |
| `ink` | `#111111` | Primary text |
| `fog` | `#888888` | Secondary/muted text |
| `label` | `#888888` | Label text |
| `line` | `rgba(0,0,0,0.08)` | Dividers and borders |

---

## Accent Colors
| Token | Value | Semantic Meaning |
|---|---|---|
| `card-blue` | `#2563eb` | Primary action, charts, CTAs |
| `card-soft` | `#e8eeff` | Light blue tint background |
| `card-dark` | `#111111` | Dark card/button background |
| `moss` | `#16a34a` | Positive, success, high volume |
| `sand` | `#d97706` | Caution, secondary action |
| `violet` / `lavender` | `#7c3aed` | Neutral accent, metrics |

---

## Status Color Pairs (Recovery States)
Used in `app/progress/page.tsx` as paired background + text colors:
| State | Background | Text |
|---|---|---|
| Fresh | `#e8fdf0` | `#16a34a` |
| Ready | `#e8eeff` | `#2563eb` |
| Fatigued / Recovering | `#fef3e2` | `#d97706` |
| Overreached | `#fee2e2` | `#dc2626` |

---

## Dark Workout Mode
Triggered by the `.workout-surface` CSS class (defined in `app/globals.css`). No system dark mode support.
| Property | Value |
|---|---|
| Background | `#0f0f14` |
| Text | `#f8f3e7` |

Legacy dark palette tokens (used in workout logger context):
| Token | Value |
|---|---|
| `night` | `#050507` |
| `paper` | `#08080b` |
| `carbon` | `#111118` |
| `graphite` | `#191823` |
| `steel` | `#9b98aa` |
| `ember` | `#f0c98d` |
| `aqua` | `#a98bff` |

---

## Shadow Utilities (`tailwind.config.ts`)
| Name | Value |
|---|---|
| `soft` | `0 4px 24px rgba(0,0,0,0.08)` |
| `card` | `0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)` |
| `glow` | `0 0 34px rgba(124,58,237,0.2)` |

---

## Heatmap Color Scale (`components/muscle-heatmap.tsx`)
Volume-based 5-step scale for the muscle heatmap:
| Sets | Color |
|---|---|
| < 3 | Light gray |
| 3–5 | Violet / lavender (`#7c3aed`) |
| 6–14 | Sand / amber (`#d97706`) |
| 15–20 | Moss / green (`#16a34a`) |
| > 20 | Ember / gold (`#f0c98d`) |

---

## Usage Patterns
- Use semantic token classes where possible: `text-ink`, `bg-surface`, `text-fog`, `border-line`
- Accent colors map consistently: moss = positive, sand = caution, violet = neutral accent
- Charts and SVGs may use raw hex values where Tailwind classes are not applicable
- The `MetricRing` component accepts an `accent` prop (`violet` | `sand` | `moss`) and maps it to stroke, text, and background colors internally
