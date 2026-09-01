---
name: Vibrant Scholastic
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
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  vivid-red: '#EF4444'
  cheerful-yellow: '#FBBF24'
  soft-bg: '#F0F4FF'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
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
  xxl: 48px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 48px
---

## Brand & Style

The design system is reimagined for the primary school ecosystem, shifting from institutional rigidity to a **Vibrant, Playful, and Energetic** personality. The target audience includes young students, teachers, and parents who require an interface that feels encouraging and approachable without sacrificing administrative clarity.

The style is a blend of **Corporate Modern** efficiency and **High-Contrast / Bold** playfulness. It utilizes saturated primary colors, generous whitespace, and softened geometry to create a "digital playground" feel. The emotional response should be one of optimism, safety, and engagement, ensuring that even complex data like attendance or alerts feels intuitive and human-centric.

## Colors

The palette is anchored by a high-saturation **Electric Blue**, designed to stand out and feel more youthful than traditional navy. 

- **Primary (#2563EB):** An energetic blue for core actions and primary navigation.
- **Success/Attendance (#10B981):** A bright, "forest-fresh" green to signify positive progress and presence.
- **Warning/Delay (#F59E0B):** A warm, cheerful orange that catches the eye without inducing panic.
- **Alert (#EF4444):** A vivid, high-chroma red for urgent notifications and absences.
- **Background (#F0F4FF):** A light, airy blue tint that keeps the interface feeling "lighter" than pure white or gray.

Contrast ratios are strictly maintained to AA standards to ensure readability for parents and accessibility in varying light conditions.

## Typography

This design system uses **Be Vietnam Pro** for its friendly, contemporary curves and exceptional legibility. To lean into the primary school aesthetic, heading weights have been increased to **Extra Bold (800)** and **Bold (700)**.

- **Headlines:** Use tighter letter spacing and heavy weights to create a "block-like" impact that feels stable and confident.
- **Body:** Standard weights are maintained at 16px to ensure long-form readability for teacher notes and reports.
- **Arabic Context:** When rendering Arabic (Tajawal/Cairo), line heights must be increased by 15-20% to prevent the collision of diacritics. All typography supports RTL by default, with right-alignment as the standard.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy but with wider margins and gutters to create a more "open" and less cluttered feel, suitable for touch-friendly interfaces.

- **Desktop (1440px):** 12-column grid. The increased gutter (24px) prevents the UI from feeling "cramped."
- **Tablet (768px):** 8-column grid with 24px margins.
- **Mobile (<768px):** 4-column grid with 20px margins to provide a safe "thumb zone" for parents on the go.

The spacing rhythm is strictly **8px-based** for component layout, while the 4px baseline is used for fine-tuning typographic alignment. In RTL mode, all horizontal spacing must be mirrored.

## Elevation & Depth

To match the playful brand, the elevation model moves away from heavy, dark shadows toward **Tonal Layers** and **Tinted Ambient Shadows**. 

- **Soft Depth:** Instead of neutral grays, shadows use a subtle primary color tint (e.g., `rgba(37, 99, 235, 0.08)`) to maintain color harmony.
- **Layering:** 
    - **Surface:** White (#FFFFFF)
    - **Mid-ground:** Primary-tinted background (#F0F4FF)
    - **Interactive:** Hover states utilize a "lift" effect where the shadow becomes more diffused and slightly larger, suggesting the physical metaphor of a button being easier to press.
- **Outlines:** Use low-contrast 1px strokes in a darkened version of the background tint rather than black, keeping the look "soft" but defined.

## Shapes

The shape language is **Rounded (Level 2)**, specifically utilizing a **12px (0.75rem)** base radius for standard components like buttons and inputs. 

- **Cards:** Large containers use `rounded-xl` (24px/1.5rem) to create a friendly, "padded" appearance.
- **Avatars/Badges:** Use a "Pill-shaped" (Full) radius to differentiate person-centric or status-centric data from structural UI elements.
- **Consistency:** Sharp corners are entirely avoided to maintain a child-friendly visual metaphor throughout the platform.

## Components

### Buttons
Primary buttons are high-saturation blue with 12px rounded corners. They utilize a subtle "press" animation (scale 0.98) to feel tactile. Text is always Bold.

### Cards
Dashboard cards use 24px rounded corners and a soft, blue-tinted shadow. Headers within cards should use a primary-tinted background bar to separate content logically.

### Inputs & Selects
Fields use a 12px radius with a 2px border. On focus, the border becomes the primary vibrant blue with a 4px soft outer glow (halo) to clearly indicate activity.

### Playful Icons
Iconography should move to a "Duo-tone" or "Rounded-cap" style with a 2.5px stroke weight. Avoid sharp angles in icon glyphs. Icons for students (e.g., backpacks, stars, apples) can use secondary brand colors (Green/Orange) to add visual delight.

### Status Chips
Attendance chips are pill-shaped.
- **Present:** Vivid Green background with dark forest-green text.
- **Late:** Cheerful Orange background with dark amber text.
- **Alert:** Vivid Red background with white text for maximum visibility.

### Lists
Lists use generous vertical padding (16px) and are separated by soft, tinted dividers to ensure high legibility for parents scanning student schedules.