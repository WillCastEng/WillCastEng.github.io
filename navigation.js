const sectionNav = document.querySelector('.section-nav');
const navItems = Array.from(sectionNav.querySelectorAll('.nav-item'));
const hoverNavigation = matchMedia('(hover: hover) and (pointer: fine)');
let openNavItem = null;
let closeTimer;

function closeNavigation(returnFocus = false) {
  clearTimeout(closeTimer);
  if (!openNavItem) return;
  const trigger = openNavItem.querySelector('.nav-trigger');
  trigger.setAttribute('aria-expanded', 'false');
  openNavItem.querySelector('.nav-panel').hidden = true;
  openNavItem = null;
  if (returnFocus) trigger.focus();
}

function openNavigation(item) {
  clearTimeout(closeTimer);
  if (openNavItem === item) return;
  closeNavigation();
  openNavItem = item;
  item.querySelector('.nav-trigger').setAttribute('aria-expanded', 'true');
  item.querySelector('.nav-panel').hidden = false;
}

navItems.forEach(item => {
  const trigger = item.querySelector('.nav-trigger');
  trigger.addEventListener('click', () => {
    if (openNavItem === item) {
      // Hover opens the panel before the click; that first click should keep it open.
      if (item.dataset.hoverOpened === 'true') delete item.dataset.hoverOpened;
      else closeNavigation();
    } else openNavigation(item);
  });
  const openWithKeyboard = event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openNavigation(item);
      item.querySelector('.nav-panel a').focus();
    }
  };
  trigger.addEventListener('keydown', openWithKeyboard);
  item.querySelector('.nav-tab-link').addEventListener('keydown', openWithKeyboard);
  item.addEventListener('pointerenter', () => {
    clearTimeout(closeTimer);
    if (hoverNavigation.matches && openNavItem !== item) {
      openNavigation(item);
      item.dataset.hoverOpened = 'true';
    }
  });
  item.addEventListener('pointerleave', () => {
    delete item.dataset.hoverOpened;
    if (hoverNavigation.matches) closeTimer = setTimeout(() => closeNavigation(), 180);
  });
});

sectionNav.addEventListener('keydown', event => {
  if (event.key === 'Escape' && openNavItem) {
    event.preventDefault();
    closeNavigation(true);
  }
});
sectionNav.addEventListener('focusout', event => {
  if (!sectionNav.contains(event.relatedTarget)) closeNavigation();
});
document.addEventListener('click', event => {
  if (!sectionNav.contains(event.target)) closeNavigation();
});
sectionNav.addEventListener('click', event => {
  const link = event.target.closest('.nav-panel a');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const destination = new URL(link.href);
  // Experience cards use measured chapter positions rather than pinned positions.
  if (destination.pathname === location.pathname && destination.hash && document.querySelector('.experience-deck')) {
    event.preventDefault();
    history.pushState(null, '', destination.hash);
    document.dispatchEvent(new CustomEvent('portfolio:navigate-section', { detail: { hash: destination.hash } }));
  }
  closeNavigation();
});
