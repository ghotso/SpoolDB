========================================
🎨 SpoolDB UI Styleguide Requirements
========================================

🏳️ Default Theme
- Modern, clean UI
- Light + Dark Mode
- Accent color: Orange (#FF7A1A)
- Neutral grays for backgrounds and surfaces
- Inter font family
- Rounded corners: 6–12px depending on component
- Soft shadows, subtle animations

🎨 Color Palette
PRIMARY ORANGE:
  - Main: #FF7A1A
  - Hover: #E46A17
  - Pressed: #CC5D14

NEUTRALS (LIGHT):
  - Background: #FFFFFF
  - Surface: #F5F5F5
  - Border: #E0E0E0
  - Text Primary: #1A1A1A
  - Text Secondary: #4A4A4A

NEUTRALS (DARK):
  - Background: #151515
  - Surface: #1E1E1E
  - Elevated: #2A2A2A
  - Border: #333333
  - Text Primary: #FAFAFA
  - Text Secondary: #C8C8C8

STATUS:
  - Success: #4CAF50
  - Warning: #FFB300
  - Danger: #E53935
  - Info: #2196F3

🧩 Typography
- Font family: Inter
- H1: 28px, H2: 22px, H3: 18px
- Body: 15–16px
- Small: 13px

🌊 Animation Guidelines
- Smooth transitions (150–250ms)
- Page fade-ins
- Modal fade + slide
- Buttons scale slightly on hover
- Progress bars animate width
- Use CSS transitions, avoid heavy animations

📦 Components
Buttons:
  - Accent: orange bg, white text
  - Secondary: gray outline
  - Ghost: no background
  - Rounded corners: 8px
Inputs:
  - 6px rounding
  - Light border (#D0D0D0 / #333 in dark)
  - Focus state in accent orange
Cards:
  - Light shadow
  - Surface background
Modals:
  - 12px rounding
  - Backdrop blur
Tables:
  - Alternating row background
  - Row highlight on hover
  - Edit/Delete icons on hover

⭐ UX Principles
- All actions max 2 clicks away
- Clear visual hierarchy
- Toast messages for success/error
- Spools <20% should visually warn user
- Confirm destructive actions
- Easy multi-language support

🎛 Integration
- Build all UI using these rules
- Ensure consistent light/dark theme variants
- All components must read from the global design tokens


