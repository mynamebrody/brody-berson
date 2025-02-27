# Windows 98 Style Personal Website

A nostalgic personal website template that recreates the Windows 98 desktop experience using only HTML, CSS, and JavaScript (with SVGs for icons).

## Features

- Classic Windows 98 aesthetic and UI elements
- Draggable, resizable windows
- Working start menu
- Taskbar with running applications
- Desktop icons that open "programs"
- Settings window with customization options
- Real-time clock in the taskbar
- Fully responsive design

## Customization Guide

### Changing Your Personal Information

1. Open `index.html` and modify the content within each window:
   - Update "About Me" window with your personal information
   - Add your projects to the "Projects" window
   - Update contact information in the "Contact" window
   - Update your resume details in the "Resume" window

### Adding or Removing Windows/Programs

1. To add a new window/program:
   - Add a new desktop icon in the `.desktop-icons` section
   - Create a corresponding window in the `.windows` section
   - Add a start menu entry in the `.start-items` section

2. To remove a window/program:
   - Remove the desktop icon, window, and start menu entry for that program

### Customizing Icons

1. Replace any SVG icon in the `/img` directory with your own
2. Make sure to maintain the same filename and structure

### Changing the Color Scheme

1. Edit `css/styles.css` to modify the color variables:
   - Background color (default: `#008080`)
   - Window color (default: `#c0c0c0`)
   - Accent colors

## Browser Compatibility

Tested and working in:
- Chrome
- Firefox
- Safari
- Edge

## Credits

- Inspired by the Windows 98 operating system
- Uses custom SVG icons designed to match the Windows 98 aesthetic
- Font: MS Sans Serif (or fallback)

## License

MIT License - Feel free to use, modify, and distribute as you wish.

---

Made with ❤️ and nostalgia 