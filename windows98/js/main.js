document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    
    // Ensure all windows are in the initial state
    document.querySelectorAll('.window').forEach(win => {
        win.style.display = 'none';
        win.classList.remove('active');
        
        // Apply consistent initial styling
        win.style.zIndex = '10';
        
        // Make sure window has proper borders even when inactive
        if (!win.classList.contains('border-fixed')) {
            win.classList.add('border-fixed');
        }
    });

    // Initialize Windows 98 desktop functionality
    initWindows();
    initDesktopIcons();
    initStartMenu();
    initTaskbar();
    updateClock();
    initSettings();
    
    // Initialize project folders
    initProjectFolders();
    
    // Initialize email form
    initEmailForm();

    // Position windows initially
    positionWindowsRandomly();
    
    // Add debug info
    console.log('Windows initialized:', document.querySelectorAll('.window').length);
    
    // Create better drag regions for all windows to ensure more accurate dragging
    document.querySelectorAll('.window').forEach(win => {
        const titleBar = win.querySelector('.window-title');
        if (titleBar) {
            // Ensure the title bar is properly set up for dragging
            titleBar.style.userSelect = 'none';
            titleBar.style.webkitUserSelect = 'none';
            titleBar.style.msUserSelect = 'none';
            titleBar.style.cursor = 'move';
        }
    });
    
    // Force the settings window to appear when clicking on Settings
    const settingsIcon = document.querySelector('.icon[data-window="settings"], .start-item[data-window="settings"]');
    if (settingsIcon) {
        console.log('Settings icon found');
        settingsIcon.addEventListener('click', function() {
            console.log('Settings clicked');
            const settingsWindow = document.getElementById('settings-window');
            if (settingsWindow) {
                settingsWindow.style.display = 'flex';
                focusWindow(settingsWindow);
                addToTaskbar(settingsWindow);
                console.log('Settings window displayed');
            } else {
                console.log('Settings window not found');
            }
        });
    }
    
    // Initialize the regroup windows system tray icon
    initRegroupWindowsIcon();
    
    // Load saved icon positions
    loadSavedIconPositions();
});

// Initialize the regroup windows system tray icon
function initRegroupWindowsIcon() {
    const regroupIcon = document.getElementById('regroup-windows');
    
    if (regroupIcon) {
        regroupIcon.addEventListener('click', function() {
            console.log('Regrouping windows...');
            regroupAllWindows();
        });
    }
}

// Regroup all windows into the visible area of the browser
function regroupAllWindows() {
    const windows = document.querySelectorAll('.window');
    const desktop = document.querySelector('.desktop');
    
    if (!desktop || windows.length === 0) return;
    
    const desktopRect = desktop.getBoundingClientRect();
    const visibleWidth = desktopRect.width - 50;  // Allow for some margin
    const visibleHeight = desktopRect.height - 80; // Allow for taskbar and margin
    
    // Get all visible windows
    const visibleWindows = Array.from(windows).filter(win => 
        win.style.display === 'flex' && !win.classList.contains('minimized')
    );
    
    console.log(`Regrouping ${visibleWindows.length} visible windows`);
    
    if (visibleWindows.length === 0) {
        alert('No open windows to regroup');
        return;
    }
    
    // Determine window size based on number of windows
    let cols = Math.ceil(Math.sqrt(visibleWindows.length));
    let rows = Math.ceil(visibleWindows.length / cols);
    
    // Calculate window size
    const winWidth = Math.floor(visibleWidth / cols);
    const winHeight = Math.floor(visibleHeight / rows);
    
    // Show regrouping animation
    showRegroupAnimation(function() {
        // Position windows in a grid to fit the visible area
        visibleWindows.forEach((win, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const left = col * winWidth;
            const top = row * winHeight;
            
            // Set the new position and size
            win.style.left = `${left}px`;
            win.style.top = `${top}px`;
            win.style.width = `${winWidth - 10}px`; // Leave small gap between windows
            win.style.height = `${winHeight - 10}px`; // Leave small gap between windows
            
            // Ensure window is visible and on top
            win.style.display = 'flex';
            win.style.zIndex = 100 + index;
            
            // Update taskbar
            const windowId = win.getAttribute('data-window');
            const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
            if (taskbarItem) {
                taskbarItem.classList.remove('active');
            }
        });
        
        // Focus the first window
        if (visibleWindows.length > 0) {
            focusWindow(visibleWindows[0]);
        }
    });
}

// Show a brief animation when regrouping windows
function showRegroupAnimation(callback) {
    // Create a flash effect
    const flashElement = document.createElement('div');
    flashElement.style.position = 'fixed';
    flashElement.style.top = '0';
    flashElement.style.left = '0';
    flashElement.style.width = '100%';
    flashElement.style.height = '100%';
    flashElement.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    flashElement.style.zIndex = '9999';
    flashElement.style.transition = 'opacity 0.3s ease-out';
    
    document.body.appendChild(flashElement);
    
    // Trigger flash animation
    setTimeout(function() {
        flashElement.style.opacity = '0';
        
        // Remove flash element after animation
        setTimeout(function() {
            document.body.removeChild(flashElement);
            if (typeof callback === 'function') {
                callback();
            }
        }, 300);
    }, 100);
}

// Save icon positions to localStorage
function saveIconPositions() {
    const icons = document.querySelectorAll('.icon');
    const positions = {};
    
    icons.forEach(icon => {
        const windowId = icon.getAttribute('data-window');
        const col = icon.getAttribute('data-grid-col');
        const row = icon.getAttribute('data-grid-row');
        
        if (windowId && col !== null && row !== null) {
            positions[windowId] = { col: parseInt(col), row: parseInt(row) };
        }
    });
    
    localStorage.setItem('iconPositions', JSON.stringify(positions));
    console.log('Icon positions saved:', positions);
}

// Load icon positions from localStorage
function loadSavedIconPositions() {
    try {
        const saved = localStorage.getItem('iconPositions');
        if (saved) {
            const positions = JSON.parse(saved);
            console.log('Loading saved icon positions:', positions);
            
            // Apply saved positions to icons
            Object.keys(positions).forEach(windowId => {
                const icon = document.querySelector(`.icon[data-window="${windowId}"]`);
                if (icon) {
                    const { col, row } = positions[windowId];
                    
                    // Set grid position
                    icon.style.gridColumn = (col + 1) + '/' + (col + 2);
                    icon.style.gridRow = (row + 1) + '/' + (row + 2);
                    
                    // Store position in attributes
                    icon.setAttribute('data-grid-col', col);
                    icon.setAttribute('data-grid-row', row);
                }
            });
            
            return true;
        }
    } catch (e) {
        console.error('Error loading saved icon positions:', e);
    }
    
    // If we couldn't load saved positions, use the default grid
    return false;
}

// Update the clock in the taskbar
function updateClock() {
    const clockElement = document.getElementById('clock');
    
    function update() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        clockElement.textContent = `${hours}:${minutes} ${ampm}`;
    }
    
    update(); // Initial update
    setInterval(update, 60000); // Update every minute
}

// Initialize all windows functionality
function initWindows() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        // Window drag functionality
        makeDraggable(win);
        
        // Add resize handles to each window
        addResizeHandles(win);
        
        // Window controls (minimize, maximize, close)
        const closeBtn = win.querySelector('.close');
        const maxBtn = win.querySelector('.maximize');
        const minBtn = win.querySelector('.minimize');
        const winTitle = win.querySelector('.window-title');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeWindow(win);
            });
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                toggleMaximize(win);
            });
        }
        
        if (minBtn) {
            minBtn.addEventListener('click', () => {
                minimizeWindow(win);
            });
        }
        
        // Double click on title bar to maximize
        if (winTitle) {
            winTitle.addEventListener('dblclick', () => {
                toggleMaximize(win);
            });
        }
        
        // Focus window on click
        win.addEventListener('mousedown', () => {
            focusWindow(win);
        });
    });
}

// Add resize handles to a window
function addResizeHandles(win) {
    // Don't add resize handles to maximized windows
    if (win.classList.contains('maximized')) {
        return;
    }
    
    // Create resize handles for all directions
    const directions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
    
    directions.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${dir}`;
        win.appendChild(handle);
        
        // Make the handle resize the window
        makeResizable(win, handle, dir);
    });
}

// Make a window resizable with a handle
function makeResizable(win, handle, direction) {
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Focus the window when starting resize
        focusWindow(win);
        
        // Store initial window size and position
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(win.offsetWidth, 10);
        startHeight = parseInt(win.offsetHeight, 10);
        startLeft = parseInt(win.style.left) || 0;
        startTop = parseInt(win.style.top) || 0;
        
        // Add resize event listeners
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
    
    function resize(e) {
        e.preventDefault();
        
        // Don't resize if maximized
        if (win.classList.contains('maximized')) {
            return;
        }
        
        // Calculate new size based on direction
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        // Calculate resize based on direction
        if (direction.includes('e')) {
            newWidth = startWidth + (e.clientX - startX);
        }
        if (direction.includes('s')) {
            newHeight = startHeight + (e.clientY - startY);
        }
        if (direction.includes('w')) {
            newWidth = startWidth - (e.clientX - startX);
            newLeft = startLeft + (e.clientX - startX);
        }
        if (direction.includes('n')) {
            newHeight = startHeight - (e.clientY - startY);
            newTop = startTop + (e.clientY - startY);
        }
        
        // Apply minimum size constraints
        newWidth = Math.max(300, newWidth);
        newHeight = Math.max(200, newHeight);
        
        // Apply new size and position
        win.style.width = newWidth + 'px';
        win.style.height = newHeight + 'px';
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
    }
    
    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// Make a window draggable
function makeDraggable(element) {
    const titleBar = element.querySelector('.window-title');
    
    if (!titleBar) return;
    
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    titleBar.addEventListener('mousedown', dragMouseDown);
    
    function dragMouseDown(e) {
        e.preventDefault();
        // Get the window to top when dragging starts
        focusWindow(element);
        
        // Get the initial mouse position
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Add event listeners for the drag actions
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }
    
    function elementDrag(e) {
        e.preventDefault();
        
        // Don't drag if maximized
        if (element.classList.contains('maximized')) {
            return;
        }
        
        // Calculate the new position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
    }
}

// Focus a window (bring to front)
function focusWindow(win) {
    console.log('Focusing window:', win.id);
    
    // Make sure we're working with a valid window element
    if (!win || !win.classList) {
        console.error('Invalid window element:', win);
        return;
    }
    
    // Ensure the window has proper styling before focusing
    if (!win.style.width) win.style.width = '450px';
    if (!win.style.height) win.style.height = '350px';
    if (!win.style.left) win.style.left = '100px';
    if (!win.style.top) win.style.top = '100px';
    
    // Get all windows
    const windows = document.querySelectorAll('.window');
    
    // Store current highest z-index
    let highestZIndex = 20; // Start with default highest
    windows.forEach(w => {
        const zIndex = parseInt(w.style.zIndex || 10);
        if (zIndex > highestZIndex) highestZIndex = zIndex;
    });
    
    // Ensure all windows first have proper display style to maintain layout
    windows.forEach(w => {
        // Make sure display is set to flex for all visible windows
        if (w.style.display !== 'none' && w.style.display !== '') {
            w.style.display = 'flex';
        }
    });
    
    // Remove active class from all other windows but maintain visibility and structure
    windows.forEach(w => {
        if (w !== win) {
            w.classList.remove('active');
            
            // Remove any inline style for title bar to use CSS classes
            const titleBar = w.querySelector('.window-title');
            if (titleBar) {
                titleBar.style.backgroundColor = '';
                titleBar.style.color = '';
            }
        }
    });
    
    // Add active class to this window and bring to front
    win.classList.add('active');
    win.style.zIndex = (highestZIndex + 1).toString(); // Always on top
    
    // Make sure all other windows have lower z-index but maintain visibility
    windows.forEach(w => {
        if (w !== win && w.style.display !== 'none') {
            // Ensure visible but not focused windows have lower z-index
            if (parseInt(w.style.zIndex || 0) >= parseInt(win.style.zIndex || 0)) {
                w.style.zIndex = '10';
            }
        }
    });
    
    // Ensure the window is visible with flex display
    if (win.style.display === 'none' || win.style.display === '') {
        win.style.display = 'flex';
    }
    
    // Remove any inline title bar styles to use CSS classes properly
    const titleBar = win.querySelector('.window-title');
    if (titleBar) {
        titleBar.style.backgroundColor = '';
        titleBar.style.color = '';
    }
    
    // Update the taskbar to show which window is active
    updateTaskbarItems();
}

// Helper function to position a window randomly
function positionWindowRandomly(windowElement) {
    const desktop = document.querySelector('.desktop');
    if (desktop) {
        const desktopWidth = desktop.clientWidth;
        const desktopHeight = desktop.clientHeight - 30; // Subtract taskbar height
        
        // Random position within visible area
        const maxLeft = Math.max(50, desktopWidth - 500);  // Ensure window is visible
        const maxTop = Math.max(50, desktopHeight - 400);  // Ensure window is visible
        
        // Generate random position with offset to prevent stacking
        const randomOffset = Math.floor(Math.random() * 50);  // Add some variance
        const left = Math.floor(Math.random() * maxLeft) + randomOffset;
        const top = Math.floor(Math.random() * maxTop) + randomOffset;
        
        windowElement.style.left = `${left}px`;
        windowElement.style.top = `${top}px`;
        console.log('Window positioned randomly at:', left, top);
    } else {
        // Fallback to default position
        windowElement.style.left = '50px';
        windowElement.style.top = '50px';
    }
}

// Initialize desktop icons
function initDesktopIcons() {
    const icons = document.querySelectorAll('.icon');
    const desktopIcons = document.querySelector('.desktop-icons');
    
    // Make desktop icons draggable
    icons.forEach(icon => {
        const iconName = icon.querySelector('span').textContent;
        console.log('Icon found:', iconName);
        
        // Variables for drag functionality
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let currentGridCol, currentGridRow;
        
        // Make icon draggable
        icon.addEventListener('mousedown', function(e) {
            // Only initiate drag on left mouse button (not on double-click)
            if (e.button !== 0 || e.detail > 1) return;
            
            e.preventDefault();
            isDragging = true;
            
            // Calculate the starting position
            startX = e.clientX;
            startY = e.clientY;
            
            // Highlight the icon
            document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            
            // Temporarily position the icon absolutely for dragging
            const iconRect = icon.getBoundingClientRect();
            startLeft = iconRect.left;
            startTop = iconRect.top;
            
            // Get grid size
            const gridCellWidth = 100;  // 80px width + 20px gap
            const gridCellHeight = 110; // 90px height + 20px gap
            
            // Calculate which grid cell the icon is in
            currentGridCol = Math.floor(startLeft / gridCellWidth);
            currentGridRow = Math.floor(startTop / gridCellHeight);
            
            // Set up move and release event listeners
            document.addEventListener('mousemove', moveIcon);
            document.addEventListener('mouseup', releaseIcon);
        });
        
        function moveIcon(e) {
            if (!isDragging) return;
            
            // Change icon styling during drag
            icon.style.position = 'absolute';
            icon.style.zIndex = '5';
            icon.style.opacity = '0.7';
            
            // Calculate new position
            const diffX = e.clientX - startX;
            const diffY = e.clientY - startY;
            
            // Update position
            icon.style.left = (startLeft + diffX) + 'px';
            icon.style.top = (startTop + diffY) + 'px';
        }
        
        function releaseIcon(e) {
            if (!isDragging) return;
            isDragging = false;
            
            // Reset icon styling
            icon.style.position = '';
            icon.style.left = '';
            icon.style.top = '';
            icon.style.zIndex = '';
            icon.style.opacity = '';
            
            // Calculate the grid cell to snap to
            const gridCellWidth = 100;  // 80px width + 20px gap
            const gridCellHeight = 110; // 90px height + 20px gap
            const desktopRect = desktopIcons.getBoundingClientRect();
            
            // Calculate which grid cell the icon should snap to
            const newGridCol = Math.floor((e.clientX - desktopRect.left) / gridCellWidth);
            const newGridRow = Math.floor((e.clientY - desktopRect.top) / gridCellHeight);
            
            // Only update if position actually changed
            if (newGridCol !== currentGridCol || newGridRow !== currentGridRow) {
                // Set new grid position using CSS Grid
                icon.style.gridColumn = (newGridCol + 1) + '/' + (newGridCol + 2);
                icon.style.gridRow = (newGridRow + 1) + '/' + (newGridRow + 2);
                
                // Store the position for persistence
                icon.setAttribute('data-grid-col', newGridCol);
                icon.setAttribute('data-grid-row', newGridRow);
                
                // Save all icon positions
                saveIconPositions();
            }
            
            // Remove event listeners
            document.removeEventListener('mousemove', moveIcon);
            document.removeEventListener('mouseup', releaseIcon);
        }
        
        // Double-click to open window
        icon.addEventListener('dblclick', () => {
            const windowId = icon.getAttribute('data-window');
            console.log('Icon double-clicked:', iconName, 'with window ID:', windowId);
            
            // Directly find the window
            const windowElement = document.getElementById(windowId + '-window');
            if (windowElement) {
                console.log('Found window element directly:', windowElement.id);
                
                // If this is Projects window, make sure it's reset to root view
                if (windowId === 'projects') {
                    // Reset folder path
                    const folderPath = windowElement.querySelector('.folder-path');
                    if (folderPath) {
                        folderPath.textContent = 'C:\\Projects\\';
                    }
                    
                    // Reset folder contents
                    const folderContents = windowElement.querySelector('.folder-contents');
                    if (folderContents) {
                        folderContents.innerHTML = `
                            <div class="folder-item project-folder" data-folder="webdev">
                                <img src="img/folder.svg" alt="Folder">
                                <span>Web Development</span>
                            </div>
                            <div class="folder-item project-folder" data-folder="mobile">
                                <img src="img/folder.svg" alt="Folder">
                                <span>Mobile Apps</span>
                            </div>
                            <div class="folder-item project-folder" data-folder="backend">
                                <img src="img/folder.svg" alt="Folder">
                                <span>Backend Services</span>
                            </div>
                            <div class="folder-item project-folder" data-folder="experiments">
                                <img src="img/folder.svg" alt="Folder">
                                <span>Experiments</span>
                            </div>
                        `;
                        
                        // Reattach event listeners
                        folderContents.querySelectorAll('.project-folder').forEach(folder => {
                            folder.addEventListener('dblclick', function() {
                                const folderType = this.getAttribute('data-folder');
                                openProjectFolder(folderType);
                            });
                        });
                    }
                    
                    // Disable Back button
                    const backButton = windowElement.querySelector('.folder-back');
                    if (backButton) {
                        backButton.classList.add('disabled');
                    }
                    
                    // Reset status
                    const statusText = windowElement.querySelector('.status-text');
                    if (statusText) {
                        statusText.textContent = '4 items';
                    }
                    
                    // Clear any folder type attribution
                    windowElement.removeAttribute('data-current-folder-type');
                }
                
                // Check if window is already open (visible)
                if (windowElement.style.display === 'flex' && 
                    (windowElement.offsetWidth > 0 || windowElement.offsetHeight > 0)) {
                    console.log('Window already open, just focusing it');
                    // Just focus the window if it's already open
                    focusWindow(windowElement);
                } else {
                    // This is the first time opening, position randomly
                    console.log('Opening window for the first time');
                    
                    // Make window visible
                    windowElement.style.display = 'flex';
                    windowElement.classList.add('active');
                    
                    // Position randomly on screen
                    positionWindowRandomly(windowElement);
                    
                    // Add to taskbar and focus
                    addToTaskbar(windowElement);
                    windowElement.style.zIndex = '1000';  // Make sure it's on top
                    focusWindow(windowElement);
                }
            } else {
                console.error('Could not find window element with ID:', windowId + '-window');
                // Try regular method as fallback
                openWindow(windowId);
            }
        });
        
        // Add single click handler for highlighting (now handled in mousedown)
        icon.addEventListener('click', (e) => {
            // Only handle regular clicks (not part of double click or drag)
            if (e.detail === 1 && !isDragging) {
                // Remove highlight from all icons
                document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
                // Add highlight to this icon
                icon.classList.add('selected');
            }
        });
    });
    
    // Initialize icon positions from saved data or spread them out
    positionIconsInGrid();
}

// Position icons in a grid
function positionIconsInGrid() {
    const icons = document.querySelectorAll('.icon');
    
    // Initial positions (one in each column, for the first row)
    let col = 0;
    const rowSize = 4; // 4 icons per row
    
    icons.forEach((icon, index) => {
        // Calculate row and column
        const row = Math.floor(index / rowSize);
        col = index % rowSize;
        
        // Set grid position
        icon.style.gridColumn = (col + 1) + '/' + (col + 2);
        icon.style.gridRow = (row + 1) + '/' + (row + 2);
        
        // Store position for persistence
        icon.setAttribute('data-grid-col', col);
        icon.setAttribute('data-grid-row', row);
    });
}

// Initialize Start Menu
function initStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const startItems = document.querySelectorAll('.start-item');
    
    // Toggle Start Menu on button click
    startButton.addEventListener('click', () => {
        // If menu is already active, just close it
        if (startMenu.classList.contains('active')) {
            startMenu.classList.remove('active');
            return;
        }
        
        // Ensure all windows are below the start menu
        document.querySelectorAll('.window').forEach(win => {
            // Make sure no window has a higher z-index than start menu
            win.style.zIndex = Math.min(parseInt(win.style.zIndex || 10), 900).toString();
        });
        
        // Show start menu with highest z-index
        startMenu.classList.add('active');
        
        // Ensure vertical text is properly positioned
        const verticalText = document.querySelector('.start-header-vertical');
        if (verticalText) {
            // Adjust vertical text position if needed
            verticalText.style.bottom = '30px';
        }
    });
    
    // Close Start Menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.classList.remove('active');
        }
    });
    
    // Handle Start Menu item clicks
    startItems.forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.getAttribute('data-window');
            console.log('Start menu item clicked:', windowId);
            
            // Use the same approach as desktop icons for consistency
            const windowElement = document.getElementById(windowId + '-window');
            if (windowElement) {
                console.log('Found window element from Start menu:', windowElement.id);
                
                // First close the start menu
                startMenu.classList.remove('active');
                
                // Check if window is already open (visible)
                if (windowElement.style.display === 'flex' && 
                    (windowElement.offsetWidth > 0 || windowElement.offsetHeight > 0)) {
                    console.log('Window already open, just focusing it');
                    // Just focus the window if it's already open
                    focusWindow(windowElement);
                } else {
                    // This is the first time opening, position randomly
                    console.log('Opening window for the first time from Start menu');
                    
                    // Make window visible
                    windowElement.style.display = 'flex';
                    windowElement.classList.add('active');
                    
                    // Position randomly on screen
                    positionWindowRandomly(windowElement);
                    
                    // Add to taskbar and focus
                    addToTaskbar(windowElement);
                    windowElement.style.zIndex = '900'; // Just below start menu z-index
                    focusWindow(windowElement);
                }
            } else {
                console.error('Could not find window from Start menu:', windowId + '-window');
                // Try regular method as fallback
                openWindow(windowId);
                
                // Close the start menu
                startMenu.classList.remove('active');
            }
        });
    });
    
    // Add keyboard shortcut (Esc to close start menu)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && startMenu.classList.contains('active')) {
            startMenu.classList.remove('active');
        }
    });
}

// Initialize taskbar
function initTaskbar() {
    const taskbarItems = document.querySelector('.taskbar-items');
    
    // Initial population of taskbar (for any open windows)
    updateTaskbarItems();
}

// Open a window by its ID
function openWindow(windowId) {
    console.log('Opening window:', windowId);
    const win = document.querySelector(`[data-window="${windowId}"]`);
    
    if (win) {
        // Log window details to help debug
        console.log('Window found:', {
            id: win.id,
            className: win.className,
            display: win.style.display,
            dataWindow: win.getAttribute('data-window')
        });
        
        // Check if window is already open and visible
        if (win.style.display === 'flex' && 
            (win.offsetWidth > 0 || win.offsetHeight > 0)) {
            console.log('Window already open, just focusing it');
            // Just focus the window if it's already open
            focusWindow(win);
            return;
        }
        
        // Show the window
        win.style.display = 'flex';
        win.classList.add('active'); // Ensure active class is added
        
        // Position window randomly on screen
        positionWindowRandomly(win);
        
        focusWindow(win);
        
        // Add to taskbar if it's not already there
        addToTaskbar(win);
        
        console.log('Window displayed:', win.style.display);
    } else {
        console.error('Window not found:', windowId);
    }
}

// Close a window
function closeWindow(win) {
    win.style.display = 'none';
    win.classList.remove('active');
    
    // Remove from taskbar
    removeFromTaskbar(win);
}

// Minimize a window
function minimizeWindow(win) {
    console.log('Minimizing window:', win.id);
    
    // Store the window's current state before minimizing (for restoration)
    win.setAttribute('data-minimized', 'true');
    win.style.display = 'none';
    win.classList.remove('active');
    
    // Keep in taskbar but update state
    updateTaskbarItems();
}

// Toggle maximize state of a window
function toggleMaximize(win) {
    if (win.classList.contains('maximized')) {
        // Restore to previous size and position
        win.classList.remove('maximized');
        
        // Get stored values or use defaults
        win.style.top = win.getAttribute('data-prev-top') || '50px';
        win.style.left = win.getAttribute('data-prev-left') || '50px';
        win.style.width = win.getAttribute('data-prev-width') || '450px';
        win.style.height = win.getAttribute('data-prev-height') || '350px';
        
        // Re-add resize handles after un-maximizing
        // First remove any existing resize handles to avoid duplicates
        win.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
        addResizeHandles(win);
    } else {
        // Save current size and position
        win.setAttribute('data-prev-top', win.style.top);
        win.setAttribute('data-prev-left', win.style.left);
        win.setAttribute('data-prev-width', win.style.width);
        win.setAttribute('data-prev-height', win.style.height);
        
        // Remove resize handles when maximized
        win.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
        
        // Maximize
        win.classList.add('maximized');
        win.style.top = '0';
        win.style.left = '0';
        win.style.width = 'calc(100% - 6px)'; // Accounting for borders
        win.style.height = 'calc(100% - 36px)'; // Accounting for taskbar
    }
}

// Add a window to the taskbar
function addToTaskbar(win) {
    const taskbarItems = document.querySelector('.taskbar-items');
    const windowId = win.getAttribute('data-window');
    
    // Safety checks
    if (!windowId) {
        console.error('Window has no data-window attribute:', win);
        return;
    }
    
    // Get the window title safely
    let windowTitle = windowId; // Default to the window ID if title not found
    const titleElement = win.querySelector('.window-title-text');
    if (titleElement && titleElement.textContent) {
        windowTitle = titleElement.textContent;
    }
    
    console.log('Adding to taskbar:', windowId, windowTitle);
    
    // Check if it's already in the taskbar
    const existingItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    
    if (!existingItem) {
        // Create new taskbar item
        const taskbarItem = document.createElement('div');
        taskbarItem.classList.add('taskbar-item');
        taskbarItem.setAttribute('data-window', windowId);
        
        // Get icon from corresponding desktop icon or start menu item
        const desktopIcon = document.querySelector(`.icon[data-window="${windowId}"] img`);
        const startMenuItem = document.querySelector(`.start-item[data-window="${windowId}"] img`);
        
        const iconSrc = desktopIcon ? desktopIcon.src : (startMenuItem ? startMenuItem.src : '');
        
        if (iconSrc) {
            const img = document.createElement('img');
            img.src = iconSrc;
            taskbarItem.appendChild(img);
        }
        
        const span = document.createElement('span');
        span.textContent = windowTitle;
        taskbarItem.appendChild(span);
        
        // Add click handler
        taskbarItem.addEventListener('click', () => {
            // Find the window by ID directly
            const windowElement = document.getElementById(windowId + '-window');
            
            if (windowElement) {
                console.log('Taskbar click for window:', windowId + '-window');
                if (windowElement.style.display === 'none' || windowElement.style.display === '') {
                    // Show the window if it's hidden
                    windowElement.style.display = 'flex';
                    windowElement.classList.add('active');
                    
                    // Position window randomly on screen for better visibility
                    positionWindowRandomly(windowElement);
                    
                    windowElement.style.zIndex = '1000';
                    focusWindow(windowElement);
                } else if (windowElement.classList.contains('active')) {
                    // Minimize if it's already active
                    minimizeWindow(windowElement);
                } else {
                    // Bring to front if it's not active
                    focusWindow(windowElement);
                }
            } else {
                console.error('Window not found for taskbar item:', windowId + '-window');
            }
        });
        
        taskbarItems.appendChild(taskbarItem);
    }
    
    // Update active state
    updateTaskbarItems();
}

// Remove a window from the taskbar
function removeFromTaskbar(win) {
    const windowId = win.getAttribute('data-window');
    const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    
    if (taskbarItem) {
        taskbarItem.remove();
    }
}

// Update taskbar items to reflect current window states
function updateTaskbarItems() {
    const windows = document.querySelectorAll('.window');
    const taskbarItems = document.querySelectorAll('.taskbar-item');
    
    // Reset all taskbar items
    taskbarItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Update taskbar items based on window states
    windows.forEach(win => {
        const windowId = win.getAttribute('data-window');
        const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
        
        if (taskbarItem) {
            if (win.classList.contains('active') && win.style.display !== 'none') {
                taskbarItem.classList.add('active');
            } else {
                taskbarItem.classList.remove('active');
            }
        }
    });
}

// Position windows in a cascading layout within desktop area
function positionWindowsRandomly() {
    const windows = document.querySelectorAll('.window');
    const desktop = document.querySelector('.desktop');
    
    if (!desktop) return;
    
    const desktopWidth = desktop.clientWidth;
    const desktopHeight = desktop.clientHeight - 30; // Subtract taskbar height
    
    console.log('Positioning windows, count:', windows.length);
    console.log('Desktop dimensions:', desktopWidth, 'x', desktopHeight);
    
    // Use cascading window positions for classic Windows 98 look
    let offsetX = 50;
    let offsetY = 50;
    const offsetIncrement = 30; // Pixels to offset each window by
    
    windows.forEach((win, index) => {
        // Remove any existing resize handles to avoid duplicates
        win.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
        
        // Set initial sizes
        win.style.width = '450px';
        win.style.height = '350px';
        
        // Calculate cascade position
        let left = offsetX + (index * offsetIncrement);
        let top = offsetY + (index * offsetIncrement);
        
        // Wrap back to top if we go too far
        if (left > desktopWidth - 500 || top > desktopHeight - 400) {
            left = 50;
            top = 50;
            offsetX = 50;
            offsetY = 50;
        }
        
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
        console.log('Window positioned:', win.id, 'at', left, top);
        
        // Add resize handles to each window
        if (!win.classList.contains('maximized')) {
            addResizeHandles(win);
        }
    });
}

// Initialize settings window functionality
function initSettings() {
    const soundToggle = document.getElementById('sound-toggle');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const wallpaperSelect = document.getElementById('wallpaper-select');
    
    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('change', function() {
            // Enable/disable sound effects logic here
            console.log('Sound effects:', this.checked);
        });
    }
    
    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }
    
    // Wallpaper select
    if (wallpaperSelect) {
        wallpaperSelect.addEventListener('change', function() {
            const desktop = document.querySelector('.desktop');
            
            // Remove all existing wallpaper classes
            desktop.classList.remove('bg-default', 'bg-clouds', 'bg-hills');
            
            // Add the selected wallpaper class
            desktop.classList.add('bg-' + this.value);
        });
    }
}

// Initialize project folders and navigation
function initProjectFolders() {
    // Folder click events
    const projectFolders = document.querySelectorAll('.project-folder');
    projectFolders.forEach(folder => {
        folder.addEventListener('dblclick', function() {
            const folderType = this.getAttribute('data-folder');
            openProjectFolder(folderType);
        });
    });
    
    // Back button in folders
    const backButtons = document.querySelectorAll('.folder-back');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentWindow = this.closest('.window');
            const currentFolderType = currentWindow.getAttribute('data-current-folder-type');
            
            // Check if this is a subfolder in the main project window
            if (currentWindow.getAttribute('data-window') === 'projects' && currentFolderType) {
                // Reset the main folder to show its original content
                const mainFolderContents = currentWindow.querySelector('.folder-contents');
                if (mainFolderContents) {
                    const folderItems = `
                        <div class="folder-item project-folder" data-folder="webdev">
                            <img src="img/folder.svg" alt="Folder">
                            <span>Web Development</span>
                        </div>
                        <div class="folder-item project-folder" data-folder="mobile">
                            <img src="img/folder.svg" alt="Folder">
                            <span>Mobile Apps</span>
                        </div>
                        <div class="folder-item project-folder" data-folder="backend">
                            <img src="img/folder.svg" alt="Folder">
                            <span>Backend Services</span>
                        </div>
                        <div class="folder-item project-folder" data-folder="experiments">
                            <img src="img/folder.svg" alt="Folder">
                            <span>Experiments</span>
                        </div>
                    `;
                    mainFolderContents.innerHTML = folderItems;
                    
                    // Reattach event listeners for the new folder items
                    mainFolderContents.querySelectorAll('.project-folder').forEach(folder => {
                        folder.addEventListener('dblclick', function() {
                            const folderType = this.getAttribute('data-folder');
                            openProjectFolder(folderType);
                        });
                    });
                    
                    // Update path back to root
                    const mainFolderPath = currentWindow.querySelector('.folder-path');
                    if (mainFolderPath) {
                        mainFolderPath.textContent = 'C:\\Projects\\';
                    }
                    
                    // Disable Back button
                    button.classList.add('disabled');
                    
                    // Update statusbar
                    const statusText = currentWindow.querySelector('.status-text');
                    if (statusText) {
                        statusText.textContent = '4 items';
                    }
                    
                    // Clear folder type attribute
                    currentWindow.removeAttribute('data-current-folder-type');
                }
            } else {
                // Default back behavior for other windows
                closeWindow(currentWindow);
                openWindow('projects');
            }
        });
    });
    
    // Up button in folders
    const upButtons = document.querySelectorAll('.folder-up');
    upButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentWindow = this.closest('.window');
            
            // For project subfolders or main project window, go back to root
            if (currentWindow.classList.contains('project-subwindow') || 
                (currentWindow.getAttribute('data-window') === 'projects' && 
                 currentWindow.getAttribute('data-current-folder-type'))) {
                
                // If we're in a subfolder in the main window
                if (currentWindow.getAttribute('data-window') === 'projects') {
                    // Just trigger back button click to restore original view
                    const backButton = currentWindow.querySelector('.folder-back');
                    if (backButton) {
                        backButton.click();
                    }
                } else {
                    // We're in a separate window
                    closeWindow(currentWindow);
                    openWindow('projects');
                }
            }
        });
    });
    
    // Project file click events
    const projectFiles = document.querySelectorAll('.project-file');
    projectFiles.forEach(file => {
        file.addEventListener('dblclick', function() {
            // For now, just show an alert with the project name
            const projectName = this.querySelector('span').textContent;
            alert(`Opening project: ${projectName}`);
        });
    });
}

// Open a specific project folder
function openProjectFolder(folderType) {
    console.log('Opening folder:', folderType);
    
    // Get the main projects window
    const projectsWindow = document.getElementById('projects-window');
    
    if (!projectsWindow) {
        console.error('Projects window not found');
        return;
    }
    
    // Make sure projects window is visible 
    if (projectsWindow.style.display === 'none' || projectsWindow.style.display === '') {
        projectsWindow.style.display = 'flex';
        focusWindow(projectsWindow);
        addToTaskbar(projectsWindow);
    }
    
    // Get the specific subfolder window to copy content from
    const subfolderWindow = document.getElementById(`${folderType}-projects-window`);
    console.log('Looking for subfolder window:', `${folderType}-projects-window`);
    
    if (subfolderWindow) {
        console.log('Found subfolder window:', subfolderWindow.id);
        
        // Get the subfolder content to copy
        const subfolderContentsElement = subfolderWindow.querySelector('.folder-contents');
        const subfolderPathElement = subfolderWindow.querySelector('.folder-path');
        const subfolderStatusElement = subfolderWindow.querySelector('.status-text');
        
        if (!subfolderContentsElement) {
            console.error('Subfolder contents not found in:', subfolderWindow.id);
            return;
        }
        
        // Get the subfolder content HTML
        const subfolderContents = subfolderContentsElement.innerHTML;
        const subfolderPath = subfolderPathElement ? subfolderPathElement.textContent : `C:\\Projects\\${folderType}\\`;
        const statusText = subfolderStatusElement ? subfolderStatusElement.textContent : '0 items';
        
        console.log('Copying content from subfolder. Path:', subfolderPath);
        
        // Update main projects window with subfolder content
        const mainFolderContents = projectsWindow.querySelector('.folder-contents');
        const mainFolderPath = projectsWindow.querySelector('.folder-path');
        const mainStatusText = projectsWindow.querySelector('.status-text');
        
        if (mainFolderContents) {
            mainFolderContents.innerHTML = subfolderContents;
            console.log('Updated main folder contents');
            
            // Re-attach event listeners to any folders in the content
            mainFolderContents.querySelectorAll('.project-folder').forEach(folder => {
                folder.addEventListener('dblclick', function() {
                    const subFolderType = this.getAttribute('data-folder');
                    openProjectFolder(subFolderType);
                });
            });
            
            // Attach event listeners to files
            mainFolderContents.querySelectorAll('.project-file').forEach(file => {
                file.addEventListener('dblclick', function() {
                    const projectName = this.querySelector('span').textContent;
                    alert(`Opening project: ${projectName}`);
                });
            });
        } else {
            console.error('Could not find folder contents in main projects window');
        }
        
        // Update path display
        if (mainFolderPath) {
            mainFolderPath.textContent = subfolderPath;
            console.log('Updated path to:', subfolderPath);
        }
        
        // Enable Back button
        const backButton = projectsWindow.querySelector('.folder-back');
        if (backButton) {
            backButton.classList.remove('disabled');
            console.log('Enabled back button');
        }
        
        // Store the folder type to track navigation
        projectsWindow.setAttribute('data-current-folder-type', folderType);
        
        // Update status text
        if (mainStatusText) {
            mainStatusText.textContent = statusText;
            console.log('Updated status text to:', statusText);
        }
        
        // Make sure the projects window is focused and visible
        projectsWindow.style.display = 'flex';
        focusWindow(projectsWindow);
    } else {
        console.error('Could not find subfolder window:', `${folderType}-projects-window`);
    }
}

// Initialize email form functionality
function initEmailForm() {
    // Email buttons
    const sendButton = document.getElementById('email-send');
    const cutButton = document.getElementById('email-cut');
    const copyButton = document.getElementById('email-copy');
    const pasteButton = document.getElementById('email-paste');
    const undoButton = document.getElementById('email-undo');
    const redoButton = document.getElementById('email-redo');
    
    // Form fields
    const emailForm = document.querySelector('.email-form');
    const subjectField = document.getElementById('email-subject');
    const messageField = document.getElementById('email-message');
    
    // History management for undo/redo
    const historyStack = [];
    const redoStack = [];
    let isUndoRedoAction = false;
    
    // Function to actually send the email using mailto
    function sendEmail(subject, body) {
        const mailtoLink = `mailto:hi@brodyberson.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }
    
    // Save message state for undo/redo (using space as delimiter)
    function saveState() {
        if (!isUndoRedoAction && messageField.value) {
            historyStack.push(messageField.value);
            // Clear redo stack when new content is added
            redoStack.length = 0;
            
            // Limit history size
            if (historyStack.length > 30) {
                historyStack.shift();
            }
        }
    }
    
    // Check for message changes to save history
    if (messageField) {
        // Save initial state
        if (messageField.value) {
            historyStack.push(messageField.value);
        }
        
        // Save state on space key (using space as word delimiter)
        messageField.addEventListener('keyup', function(e) {
            if (e.key === ' ' || e.keyCode === 32) {
                saveState();
            }
        });
        
        // Also save periodically for multi-word typing without spaces
        messageField.addEventListener('input', function() {
            if (!isUndoRedoAction) {
                // Clear any pending save
                if (this.saveTimeout) {
                    clearTimeout(this.saveTimeout);
                }
                
                // Schedule a save in 1.5 seconds if no space is typed
                this.saveTimeout = setTimeout(function() {
                    saveState();
                }, 1500);
            }
        });
    }
    
    // Send button functionality
    if (sendButton && emailForm) {
        sendButton.addEventListener('click', function() {
            const subject = subjectField.value.trim();
            const message = messageField.value.trim();
            
            if (!subject) {
                alert('Please enter a subject for your message.');
                subjectField.focus();
                return;
            }
            
            if (!message) {
                alert('Please enter a message body.');
                messageField.focus();
                return;
            }
            
            // Send the actual email via mailto
            sendEmail(subject, message);
            
            // Show success message
            alert('Opening your email client to send the message to hi@brodyberson.com');
            
            // Reset the form
            subjectField.value = '';
            messageField.value = '';
            
            // Clear history stacks
            historyStack.length = 0;
            redoStack.length = 0;
            
            // Close the window after a slight delay to allow the mailto to open
            setTimeout(function() {
                const contactWindow = document.querySelector('[data-window="contact"]');
                closeWindow(contactWindow);
            }, 500);
        });
    }
    
    // Cut button functionality
    if (cutButton && messageField) {
        cutButton.addEventListener('click', function() {
            // Save state before cut
            saveState();
            
            // Get selected text
            const selectedText = window.getSelection().toString();
            
            // Copy to clipboard if there's a selection
            if (selectedText && document.activeElement === messageField) {
                document.execCommand('cut');
            }
        });
    }
    
    // Copy button functionality
    if (copyButton && messageField) {
        copyButton.addEventListener('click', function() {
            // Get selected text
            const selectedText = window.getSelection().toString();
            
            // Copy to clipboard if there's a selection
            if (selectedText && document.activeElement === messageField) {
                document.execCommand('copy');
            }
        });
    }
    
    // Paste button functionality
    if (pasteButton && messageField) {
        pasteButton.addEventListener('click', function() {
            // Save state before paste
            saveState();
            
            // Paste at current position
            if (document.activeElement === messageField) {
                document.execCommand('paste');
            }
        });
    }
    
    // Undo button functionality (word-by-word)
    if (undoButton && messageField) {
        undoButton.addEventListener('click', function() {
            if (historyStack.length > 0) {
                // Save current state to redo stack
                redoStack.push(messageField.value);
                
                // Pop state from history
                const previousState = historyStack.pop();
                
                // Set flag to prevent input event from adding to history
                isUndoRedoAction = true;
                
                // Restore previous state
                messageField.value = previousState;
                
                // Reset flag
                setTimeout(() => {
                    isUndoRedoAction = false;
                }, 100);
            }
        });
    }
    
    // Redo button functionality (word-by-word)
    if (redoButton && messageField) {
        redoButton.addEventListener('click', function() {
            if (redoStack.length > 0) {
                // Save current state to history stack
                historyStack.push(messageField.value);
                
                // Pop state from redo stack
                const nextState = redoStack.pop();
                
                // Set flag to prevent input event from adding to history
                isUndoRedoAction = true;
                
                // Restore next state
                messageField.value = nextState;
                
                // Reset flag
                setTimeout(() => {
                    isUndoRedoAction = false;
                }, 100);
            }
        });
    }
    
    // Add keyboard shortcuts
    if (messageField) {
        messageField.addEventListener('keydown', function(e) {
            // Ctrl+Z for Undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undoButton.click();
            }
            
            // Ctrl+Y for Redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redoButton.click();
            }
            
            // Ctrl+X for Cut
            if (e.ctrlKey && e.key === 'x') {
                // Cut handled by browser, just save state
                saveState();
            }
            
            // Ctrl+V for Paste
            if (e.ctrlKey && e.key === 'v') {
                // Paste handled by browser, just save state
                saveState();
            }
        });
    }
} 