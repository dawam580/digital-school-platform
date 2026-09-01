---
name: Institutional Modernity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#70000c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b0015'
  on-tertiary-container: '#ffa39c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: beVietnamPro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  display-md:
    fontFamily: beVietnamPro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: beVietnamPro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: beVietnamPro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: beVietnamPro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: beVietnamPro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: beVietnamPro
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
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built on the principles of **Institutional Modernity**, specifically tailored for the Middle Eastern educational landscape. It balances the authority of a formal academic institution with the accessibility of a modern SaaS platform. 

The visual language is rooted in **Minimalism** with a **Corporate** focus, emphasizing clarity, order, and trust. The interface uses a clean, structured grid, generous whitespace to reduce cognitive load for staff and parents, and a Right-to-Left (RTL) first orientation. The emotional goal is to evoke a sense of reliability and calm through stable geometry and a professional color palette.

## Colors

The palette is anchored by **Calm Corporate Blue**, selected to convey institutional stability and trust. 

- **Primary (#1E40AF):** Used for navigation, primary actions, and branding.
- **Success (#10B981):** Reserved for attendance, positive grade indicators, and completed tasks.
- **Danger (#EF4444):** Used sparingly for absences, alerts, and critical system warnings.
- **Background (#F8FAFC):** A cool-tinted white that reduces screen glare and distinguishes the background from white surface containers.
- **Neutral (#64748B):** Used for secondary text and borders to maintain a soft, professional contrast.

## Typography

While the platform is Arabic-first, the typography system utilizes **beVietnamPro** for Latin characters and system metrics, pairing seamlessly with traditional Arabic typefaces like *Cairo* or *Tajawal*. 

The scale is intentionally legible to accommodate diverse user groups, from tech-savvy administrators to parents viewing reports on mobile devices. 
- **Headlines:** Use a bold weight to establish clear content hierarchy.
- **Body:** Set at a base of 16px to ensure readability for long-form student reports.
- **RTL Handling:** All text alignment is default to the right. Line heights are slightly increased compared to Latin standards to accommodate the taller ascenders and descenders of Arabic script.

## Layout & Spacing

The design system employs a **Fluid Grid** model with a maximum container width for desktop displays to prevent line lengths from becoming unreadable.

- **Desktop (1440px+):** 12-column grid with 40px side margins and 20px gutters.
- **Tablet (768px - 1023px):** 8-column grid with 24px side margins.
- **Mobile (<767px):** 4-column grid with 16px side margins.

The spacing rhythm is built on a **4px baseline**, ensuring all components align to a mathematical scale. RTL flipping must be applied to all margins and paddings: `padding-left` in LTR becomes `padding-right` in this design system.

## Elevation & Depth

This design system uses **Tonal Layers** and **Ambient Shadows** to create a sense of organized depth. Surfaces are stacked to guide the user's focus.

1.  **Level 0 (Background):** #F8FAFC. The lowest layer.
2.  **Level 1 (Cards/Surface):** #FFFFFF. Used for the main content areas. It features a very soft, diffused shadow: `0 4px 12px rgba(30, 64, 175, 0.05)`.
3.  **Level 2 (Modals/Popovers):** Floating elements that require higher prominence. These use a more defined shadow to signify their temporary nature: `0 12px 24px rgba(0, 0, 0, 0.08)`.

Borders are kept minimal, using a light 1px stroke (#E2E8F0) for input fields and separators, rather than heavy outlines.

## Shapes

The shape language is **Rounded**, reflecting a friendly and modern institutional character.
- **Standard Components:** Buttons, input fields, and small widgets use a 0.5rem (8px) radius.
- **Content Containers:** Large cards and dashboard sections use a 1rem (16px) radius to soften the interface.
- **Interactive States:** On hover, shapes remain consistent, but elevation increases slightly to indicate interactivity.

## Components

### Buttons
- **Primary:** Filled with #1E40AF, white text. Bold weight.
- **Secondary/Ghost:** Outlined with a 1px primary color stroke or a light gray.
- **Interaction:** 10% dark overlay on hover to provide immediate feedback.

### Cards
- White background, 16px rounded corners, and Level 1 shadow. 
- Padding should be consistent (24px for desktop, 16px for mobile).

### Input Fields
- Outlined style with #E2E8F0 border.
- Labels are positioned at the top-right (RTL).
- On focus, the border transitions to Primary Blue (#1E40AF) with a soft 2px outer glow.

### Status Badges
- **Attendance:** Soft green background (#DCFCE7) with dark green text (#166534).
- **Absence:** Soft red background (#FEE2E2) with dark red text (#991B1B).
- Badges use "Pill-shaped" roundedness for quick visual scanning.

### Icons
- Use monolinear icons with a 2px stroke width. 
- All icons should be mirrored for RTL where directionality matters (e.g., arrows, progress bars).