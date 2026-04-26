---
name: Executive Excellence
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#444653'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#747684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3456c1'
  primary: '#00216e'
  on-primary: '#ffffff'
  primary-container: '#0033a0'
  on-primary-container: '#8ea6ff'
  inverse-primary: '#b6c4ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#26292b'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c3f41'
  on-tertiary-container: '#a8aaac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#133ca8'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
---

## Brand & Style

This design system establishes a premium, authoritative atmosphere for a software house training environment. The brand personality is **Elite, Methodical, and Empowering**, striking a balance between a high-stakes corporate software house and an aspirational educational platform. It aims to evoke a sense of professional growth and technical mastery.

The visual style is **Corporate / Modern** with a high-fidelity execution. It utilizes generous whitespace to reduce cognitive load during complex training tasks, while incorporating "Prestige Accents" through the strategic use of gold. The interface avoids the playfulness of consumer apps in favor of a "Work-Ready" aesthetic—utilizing crisp edges, subtle depth, and intentional information density to prepare students for professional software engineering environments.

## Colors

The color palette is built on a foundation of **Royal Blue** to project stability and intelligence, complemented by **Sophisticated Gold** to denote achievement and excellence.

- **Primary (Royal Blue):** Used for core navigation, primary actions, and brand identification. It represents the "Software House" authority.
- **Secondary (Gold):** Reserved for "Moment of Excellence" accents—progress indicators, achievement badges, and premium feature highlights.
- **Backgrounds:** A mix of **Crisp White** for main content areas and very light cool grays (Slate 50) for structural grouping.
- **Neutrals:** A spectrum of Slates and Navies are used for text and iconography to maintain high legibility and a professional tone.

## Typography

The typography system utilizes **Manrope** for its modern, geometric construction and exceptional readability in technical contexts. 

- **Headlines:** Use tighter letter-spacing and heavier weights (700-800) to create a strong visual anchor.
- **Body Text:** Standard weight (400) with generous line heights (1.5 - 1.6) to ensure long-form training modules and documentation remain accessible.
- **Labels:** Higher weights (600-700) and occasional uppercase styling are used for metadata, status badges, and table headers to distinguish them from interactive content.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the main content container to maintain a readable line length, while the header and navigation remain fluid.

- **Grid:** A 12-column system is used for dashboard layouts and data-heavy views.
- **Rhythm:** A 4px baseline grid ensures vertical consistency across all components.
- **Sectioning:** Large `xxl` (80px) vertical spacing is used between major landing sections, while `lg` (24px) is the standard for card-to-card gutters.
- **Density:** Training modules utilize "Comfortable" spacing, whereas student data tables utilize "Compact" spacing to maximize information visibility.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. This design system avoids harsh borders in favor of soft, diffused shadows that lift components off the background.

- **Low Elevation:** Used for cards and secondary buttons. A soft 4px blur with 5% opacity blue-tinted shadow.
- **Mid Elevation:** Used for hover states and dropdown menus. An 8px-12px blur with 8% opacity.
- **High Elevation:** Reserved for modals and critical pop-overs. A 24px blur with 12% opacity.
- **Tonal Contrast:** Backgrounds use a light "Slate 50" to make white "Surface" cards pop without requiring heavy outlines.

## Shapes

The shape language is defined as **Rounded**, conveying a modern and approachable software aesthetic while maintaining professional rigor.

- **Cards & Sections:** Use `rounded-lg` (1rem) to create a soft, modern container feel.
- **Buttons & Inputs:** Use `rounded-md` (0.5rem) to provide a distinct, clickable appearance that feels stable.
- **Badges:** Utilize a "Pill" shape (full rounding) to differentiate them from interactive buttons and indicate status or categories.
- **Imagery:** Hero images and student profiles should feature a consistent 1.5rem corner radius to align with the soft-UI aesthetic.

## Components

### Buttons
- **Primary:** Solid Royal Blue with white text. High-contrast, 0.5rem corner radius.
- **Secondary:** White background with Royal Blue border and text.
- **Tertiary (Gold):** Reserved for "Upgrade" or "Certificate" actions. Solid Gold with Navy text.

### Cards
- Rounded (1rem), white background, soft ambient shadow.
- Header sections within cards should have a subtle 1px bottom border (Slate 100).

### Data Tables
- Sleek, borderless design.
- Row headers use `label-md` typography.
- Alternating row highlights (Slate 50) on hover.
- Gold accents used for "High Achievement" or "Completed" rows.

### Badges & Statuses
- **Success:** Soft green background with dark green text.
- **In-Progress:** Soft blue background with Royal Blue text.
- **Attention:** Soft gold background with deep gold/brown text.
- Always pill-shaped with bold, small-caps or uppercase labels.

### Input Fields
- Subtle 1px border (Slate 200).
- 0.5rem corner radius.
- Focus state: 2px Royal Blue border with a soft blue outer glow.

### Navigation
- Vertical sidebar for dashboard views using a deep Navy background with "Ghost" style active states (translucent white overlays).
- Top navigation for public pages using clear white backgrounds and thin glassmorphism effects when scrolling.