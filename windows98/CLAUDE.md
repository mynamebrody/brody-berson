# CLAUDE.md - Development Guide

## Project Overview
Windows 98-style personal website using vanilla HTML, CSS, and JavaScript.

## Commands
- **Development**: `npm start` or `npm run dev` - Starts development server with `serve .`
- **Deploy**: No build step - deploy static files directly

## Code Style Guidelines
- **Indentation**: 4 spaces for all files (HTML, CSS, JS)
- **Naming**: descriptive, lowercase-hyphenated for CSS classes, camelCase for JS
- **JavaScript**: 
  - Vanilla JS only (no frameworks)
  - Event-driven architecture
  - Single responsibility functions
  - Clear comments for complex operations
- **CSS**:
  - Component-based organization
  - Windows 98 UI conventions
  - Section dividers with comments
- **HTML**: Semantic tags with proper nesting

## Structure
- `/css/` - Stylesheets (styles.css, windows98.css)
- `/img/` - SVG icons and images
- `/js/` - JavaScript files
- `/index.html` - Main document

## UI Principles
Maintain Windows 98 aesthetic - pixel-perfect borders, classic colors (#c0c0c0, #000080, etc.),
and interaction patterns (double-click to open, draggable windows).

# Windows 98 Aesthetic Analysis

## Overall Aesthetic
Windows 98 embraced a utilitarian design philosophy that prioritized functionality over form. The interface features a structured, grid-based layout with clearly defined boundaries between elements. It represents early digital skeuomorphism—where digital objects mimic their real-world counterparts (folders, documents, etc.). The aesthetic is characterized by its boxy windows with raised borders, creating a pseudo-3D effect that makes interactive elements appear "clickable" or "pressable."

## Color Palette
- **Base color**: Teal blue (#008080) as the default desktop background
- **System elements**: Gray (#C0C0C0) for window bodies, menu bars, and dialog boxes
- **Accent colors**: Navy blue for selected items and title bars
- **Text**: Black for standard text, white for title bar text
- **Highlight colors**: Limited use of bright green and red for system indicators
- **High contrast elements**: Black borders around windows and buttons

## Typography
- Sans-serif system fonts (primarily MS Sans Serif) at 8pt size
- Limited typographic hierarchy—mostly through bold text rather than size variation
- Fixed-width text spacing with minimal kerning
- Aliased (non-smoothed) text rendering, creating a distinctly "pixelated" appearance
- All-caps used for emphasis in certain system areas like "OK" and "CANCEL" buttons

## Imagery and Iconography
- Low-resolution, 16-color or 256-color icons with distinct black outlines
- Simple, literal representations of objects (folders, documents, computer)
- The Windows logo featuring four colored squares in red, green, blue, and yellow
- Icons arranged on a invisible grid system
- Small 16×16 pixel icons in menus and larger 32×32 pixel icons on the desktop
- Limited use of gradients—most color areas are flat and solid

## UI Elements
- Chunky, 3D-styled buttons with visible borders that appear to "depress" when clicked
- Dialog boxes with clear title bars and consistent placement of OK/Cancel buttons
- Pull-down menus with drop shadows to create depth
- Tabbed interfaces for organizing complex settings (visible in System Properties)
- Start button in the bottom-left corner leading to a hierarchical menu system
- Taskbar showing running applications along the bottom of the screen

## Copywriting and Tone
- Straightforward, utilitarian language focused on functionality
- Brief, direct labels ("Find," "Run," "Help," "Settings")
- Minimal explanatory text—assumes user familiarity with computing concepts
- Technical terminology used without much simplification ("Device Manager," "Hardware Profiles")
- Consistent use of proper nouns for Microsoft products ("Microsoft Windows 98")
- Formal language that emphasizes the computer as a tool rather than a companion

## Key Takeaways to Recreate This Style

1. **Embrace the Grid**: Maintain strict alignment of elements within a visible grid system.

2. **Use the Color Palette**: Build around the teal blue, gray, navy, and black color scheme.

3. **Create Depth Through Borders**: Use light/dark border pairs to create the raised "3D" effect on buttons and windows.

4. **Keep Typography Simple**: Use plain sans-serif fonts at small sizes with minimal variation.

5. **Respect the Pixel**: Design with pixel-perfect precision—avoid anti-aliasing or smooth gradients.

6. **Utilize Clear Hierarchy**: Maintain consistent placement of window elements (title bars, menu bars, status bars).

7. **Embrace Skeuomorphism**: Use icons that directly represent their real-world counterparts.

8. **Prioritize Function Over Form**: Design elements that clearly communicate their purpose rather than their aesthetic appeal.

9. **Include Deliberate Constraints**: Limit color usage and embrace the technical limitations of the era.

10. **Add System Details**: Include elements like the Start button, system tray, and desktop icons to complete the aesthetic.

This Windows 98 interface represents a pivotal moment in computing history when personal computers were becoming mainstream but still maintained a distinctly utilitarian character—before the more polished, consumer-friendly aesthetics that would emerge in later versions.