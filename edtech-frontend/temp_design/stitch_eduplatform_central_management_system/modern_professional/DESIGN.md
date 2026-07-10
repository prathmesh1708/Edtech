---
name: Modern Professional
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fc'
  surface-container: '#ebedf7'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e0e2eb'
  on-surface: '#181c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2d3037'
  inverse-on-surface: '#eef0fa'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005ab4'
  on-primary: '#ffffff'
  primary-container: '#0a73e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#964400'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd5700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#f9f9ff'
  on-background: '#181c22'
  surface-variant: '#e0e2eb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Design System: Modern Professional

## Brand & Style
The brand identity has shifted from a warm, high-energy aesthetic to a cool, reliable, and professional "Corporate Modern" style. The personality is focused on trust, precision, and clarity. It utilizes a balanced approach inspired by modern interface guidelines, emphasizing a clean and functional environment for users. The goal is to evoke a sense of stability and technological competence through a refined blue-centric palette and streamlined typography.

## Colors
The palette is anchored by a vibrant yet professional Primary Blue (#1275e2), which serves as the main driver for action and identity. The Secondary color is a muted, desaturated blue-grey (#5f78a3) used for supporting elements and less prominent UI components. A Tertiary orange-brown (#c55b00) provides a strategic accent for highlights or warnings without breaking the professional tone. The Neutral tones (#74777f) are balanced greys that provide structure and background stability in a light color mode.

## Typography
The system has transitioned to "Inter" across all levels—headlines, body text, and labels. Inter provides exceptional legibility and a contemporary feel. Headlines use a semi-bold weight to establish clear hierarchy, while body text is set with generous line heights to ensure readability in data-heavy layouts.

*   **Headlines:** Inter, Semi-Bold.
*   **Body:** Inter, Regular.
*   **Labels:** Inter, Medium.

## Layout & Spacing
The layout follows a 12-column fluid grid system that prioritizes alignment and mathematical consistency. A standard spacing unit of 2 (8px base) provides the rhythm for gutters (16px) and margins (24px). 

*   **Mobile:** 4-column grid, 16px margins.
*   **Desktop:** 12-column grid, 24px margins.

## Elevation & Depth
Depth is communicated through tonal layering and soft ambient shadows. Rather than heavy borders, the system uses subtle shifts in surface color to separate content. Low-opacity shadows are used sparingly on elevated components like cards and dropdown menus to provide a gentle lift from the background.

## Shapes
The design moves away from sharp edges to a "Rounded" geometry. Standard components feature a 0.5rem corner radius, while larger containers like cards use 1rem (rounded-lg). This softening of the interface makes the brand feel more approachable and user-friendly.

## Components
*   **Buttons:** Feature 8px (0.5rem) rounded corners. Primary buttons use the #1275e2 fill with white text.
*   **Input Fields:** Utilize the neutral #74777f for borders, switching to the primary blue on focus.
*   **Cards:** Use a "rounded-lg" (1rem) radius and a low-opacity ambient shadow for elevation.
*   **Chips & Labels:** Follow the "Inter" typography guidelines with medium weights for high scannability.