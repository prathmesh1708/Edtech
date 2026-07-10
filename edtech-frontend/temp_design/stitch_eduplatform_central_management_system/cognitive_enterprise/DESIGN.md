---
name: Cognitive Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 32px
  gutter: 20px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for high-density information environments, specifically tailored for education administrators who manage complex datasets. The brand personality is **authoritative, efficient, and precise**. It avoids visual fluff in favor of clarity and utility, ensuring that the interface never distracts from the critical task of data analysis and institutional management.

The design style is **Corporate Modern**, drawing inspiration from high-end enterprise SaaS. It utilizes a systematic approach to whitespace and hierarchy to reduce cognitive load. The aesthetic is characterized by:
- **Functional Minimalism:** Every element serves a purpose; decorative flourishes are removed to prioritize content.
- **Structured Precision:** A rigid adherence to grid systems and consistent alignment to convey reliability.
- **Subtle Sophistication:** Low-contrast borders and purposeful use of color to guide the eye without overwhelming the user.

## Colors

The color palette is built on a foundation of "Deep Slate" and "Professional Blue" to establish a trustworthy, academic atmosphere. 

- **Primary Action:** Used for sidebar backgrounds and high-level headers to provide a strong structural anchor.
- **Secondary Action:** Reserved for primary buttons, active states, and interactive elements.
- **Neutral Palette:** A sophisticated range of cool grays (Slate) used for borders, backgrounds, and secondary text to maintain a clean, airy feel.
- **Semantic Accents:** Highly saturated tones for Success, Warning, and Error states, used sparingly to highlight data anomalies and system status.

## Typography

This design system utilizes **Inter** for its exceptional legibility in data-dense interfaces and its neutral, professional character. 

- **Scale:** The type scale is tight to maximize information density. 
- **Hierarchy:** We use weight (SemiBold/Bold) rather than size to differentiate headlines from body text, keeping the interface compact.
- **Data Display:** For ID numbers, codes, or tabular figures, use a monospaced font like **JetBrains Mono** to ensure vertical alignment and quick scanning.
- **Labels:** Small, uppercase labels with slight letter spacing are used for table headers and section titles to create a clear "meta-layer" above the data.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid model**. The sidebar navigation is fixed at 260px, while the main content area fluidly expands to fill the remaining viewport, utilizing a maximum width of 1600px to prevent excessive line lengths on ultra-wide monitors.

- **Grid:** A 12-column grid is used for dashboard layouts. Widgets and charts should span 3, 4, 6, or 12 columns.
- **Rhythm:** An 8px base unit (with a 4px sub-step) governs all padding and margins. 
- **Density:** The system prioritizes "Compact" spacing in data tables (8px vertical cell padding) and "Comfortable" spacing for form layouts (24px gap between sections).
- **Mobile:** On screens below 768px, the sidebar collapses into a drawer, and the 12-column grid reflows into a single column.

## Elevation & Depth

This design system uses **Tonal Layers and Low-Contrast Outlines** rather than heavy shadows to indicate depth. This maintains a flat, modern aesthetic that feels integrated into the screen.

- **Level 0 (Background):** Slate-50 (#F8FAFC). Used for the main canvas.
- **Level 1 (Cards/Containers):** White (#FFFFFF) with a 1px border in Slate-200. This is the primary surface for data tables and charts.
- **Level 2 (Dropdowns/Modals):** White with a soft, ambient shadow (0px 4px 12px rgba(15, 23, 42, 0.08)) to indicate temporary overlay.
- **Active States:** Subtle 2px "Focus Rings" using the Secondary color with 20% opacity.

## Shapes

The shape language is **Professional and Subdued**. We use a "Soft" corner radius (4px to 8px) to provide a modern feel without appearing too casual or consumer-oriented.

- **Standard Elements:** Buttons, inputs, and small cards use a 6px radius.
- **Status Badges:** Use a 4px radius or full-pill shape depending on the context.
- **Large Containers:** Dashboard widgets and main content panels use an 8px radius.
- **Data Points:** Markers in line charts and scatter plots should be circular to contrast against the rectangular UI.

## Components

### Data Tables
Tables are the core of the admin experience. 
- **Header:** Sticky headers with Slate-100 background.
- **Rows:** Zebra striping (Slate-50) for readability in wide tables. 
- **Alignment:** Text is left-aligned; numerical data is right-aligned.
- **Actions:** Row actions appear on hover or in a dedicated "More" ellipsis menu at the end of the row.

### Sidebar Navigation
- **Primary State:** Deep Slate background with light text.
- **Active State:** A subtle left-border accent in Secondary Blue and a high-contrast text color.
- **Grouping:** Navigation items should be grouped by functional domain (e.g., "Academics," "Users," "Financials") with clear, small-caps section headers.

### Buttons & Inputs
- **Primary Button:** Solid Secondary Blue with white text.
- **Secondary Button:** White background with Slate-200 border and Primary text.
- **Input Fields:** 1px Slate-300 border, turning Blue on focus. Labels sit outside the field in `body-sm` bold.

### Status Badges
- Small, low-opacity background with high-contrast text (e.g., a light green background with dark green text for "Active"). 
- Used in tables to denote student status, payment status, or system health.

### Charts & Visualization
- Use the semantic color palette for data series. 
- All charts must include a legend and tooltips that follow the Elevation Level 2 style.
- Axis labels use `label-sm` in Tertiary Slate.