// Theme Toggle Functionality
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.add('animation-ready');
  // Add spin and fade animations to the icon
  const icon = themeToggleBtn.querySelector('i');
  icon.classList.add('fa-shake', 'fa-fade');

  document.body.classList.toggle('dark');
  
  if (body.classList.contains('dark')) {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }

  // Remove animations after transition (500ms)
  setTimeout(() => {
    icon.classList.remove('fa-shake', 'fa-fade');
  }, 600);
});

// Existing space bar toggle functionality
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    themeToggleBtn.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }
});
