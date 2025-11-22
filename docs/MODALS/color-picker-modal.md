# Color Picker Modal

**File:** `frontend/src/components/ColorPickerModal.tsx`

## Overview

A modal dialog for selecting or creating colors with a visual color picker and most-used colors grid.

## Props

```typescript
interface ColorPickerModalProps {
  color: string;                    // Initial hex color
  onColorChange: (color: string) => void;  // Called when color changes
  onClose: () => void;
  onSave: () => void;                // Called when save button is clicked
  isEdit?: boolean;                  // Edit mode flag
}
```

## Features

### Color Selection
- **Hex Input**: Text input for hex color code (with validation)
- **Color Picker**: Native browser color picker
- **Most Used Colors**: Grid of 15 most frequently used colors with hex codes
  - Displays as colored squares
  - Highlights selected color with border
  - Hover effect for better UX

### Color Creation
- When saving, creates a new color if the hex code doesn't exist
- Uses hex code as the color name (uppercase)
- Automatically selects the newly created color

### Visual Feedback
- Selected color is highlighted in the most-used grid
- Color picker and hex input are synchronized
- Real-time preview of selected color

## State Management

- `selectedColor`: Currently selected hex color
- `mostUsedColors`: Array of most-used colors
- `loadingColors`: Loading state for most-used colors

## API Calls

- `colorsMostUsedApi.list(15)`: Load 15 most-used colors
- `colorsApi.create({ name, hex })`: Create new color (via parent component)

## Usage Example

```tsx
<ColorPickerModal
  color="#FF0000"
  onColorChange={(hex) => setPickedColorHex(hex)}
  onClose={() => setShowColorPicker(false)}
  onSave={async () => {
    const colorName = pickedColorHex.toUpperCase();
    const newColor = await colorsApi.create({ 
      name: colorName, 
      hex: pickedColorHex 
    });
    setFormData({ ...formData, color_id: newColor.id });
    setShowColorPicker(false);
  }}
  isEdit={false}
/>
```

## Notes

- Only colors with hex codes are shown in the most-used grid
- Hex validation: `^#[0-9A-Fa-f]{6}$`
- Modal has backdrop blur effect
- Clicking backdrop closes the modal

