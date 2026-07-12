# Nudge Design System

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Pure Black | `#000000` | Main page background |
| Surface | Near Black | `#0D0D0D` | Cards, panels, modals, containers |
| Primary | Purple | `#6C63FF` | Buttons, highlights, icons, CTAs |
| Accent | Light Purple | `#A89EFF` | Headings, subtext accents, secondary highlights |
| Success | Bright Green | `#00E896` | Completed tasks, streaks, positive states |

## Typography

### Display Font (Headings)
- **Font**: Syne (Extra Bold)
- **Usage**: H1, H2, H3, H4, H5, H6, buttons, prominent text
- **Weight**: 700-800

### Body Font
- **Font**: Inter
- **Usage**: Paragraph text, body copy, labels
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## Component Usage

### Buttons
```jsx
// Primary action (purple)
<button className="btn-primary">Action</button>

// Success action (green)
<button className="btn-success">Complete</button>
```

### Cards & Containers
```jsx
// Card with border and padding
<div className="card">Content</div>

// Panel with glass effect
<div className="panel">Content</div>

// Modal dialog
<div className="modal">Content</div>
```

### Text Styling
```jsx
// Heading with Syne font
<h1 className="font-display text-2xl font-bold">Title</h1>

// Accent text (light purple)
<p className="text-accent">Accent text</p>

// Success text (bright green)
<p className="text-success">Completed!</p>
```

## Tailwind Color Classes

All colors are available via Tailwind classes:
- `bg-background`, `text-background`
- `bg-surface`, `text-surface`
- `bg-primary`, `text-primary`
- `bg-accent`, `text-accent`
- `bg-success`, `text-success`

## Design Tokens (CSS Variables)

In CSS/SCSS files, use these variables:
```css
--color-background: #000000
--color-surface: #0D0D0D
--color-primary: #6C63FF
--color-accent: #A89EFF
--color-textPrimary: #FFFFFF
--color-textSecondary: #A89EFF
--color-border: #1A1A1A
--color-success: #00E896
--font-sans: 'Inter', sans-serif
--font-display: 'Syne', sans-serif
```
