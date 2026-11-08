// Native page scrolling drives the deck; taller cards remain fully readable.
const deck = document.querySelector('.experience-deck');
const cards = Array.from(deck.querySelectorAll('.experience-card'));
const links = Array.from(document.querySelectorAll('.experience-jump a'));
const header = document.querySelector('.header');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let starts = [];
let queued = false;
let resizeQueued = false;

function paint() {
  queued = false;
  const inset = header.offsetHeight + 20;
  let active = 0;
  cards.forEach((card, index) => {
    const next = cards[index + 1];
    const progress = next && !motion.matches
      ? Math.min(1, Math.max(0, (innerHeight - next.getBoundingClientRect().top) / Math.max(1, innerHeight - inset)))
      : 0;
    card.style.setProperty('--card-depth', progress.toFixed(4));
    if (card.getBoundingClientRect().top <= inset + innerHeight * .25) active = index;
  });
  cards.forEach((card, index) => {
    // Keep each card's space in the deck, but clear earlier cards from view
    // once the next chapter is primary. Reverse scrolling restores them.
    const covered = deck.classList.contains('deck-ready') && index < active;
    card.classList.toggle('card-covered', covered);
    card.inert = covered;
  });
  document.body.classList.toggle('garage-active', cards[active].id === 'garage-workshop');
  links.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function measure() {
  resizeQueued = false;
  // Measure document positions before pinning so chapter links work both ways.
  deck.classList.remove('deck-ready');
  starts = cards.map(card => card.getBoundingClientRect().top + scrollY);
  cards.forEach((card, index) => {
    card.style.setProperty('--card-index', index + 1);
    const top = Math.min(header.offsetHeight + 20, innerHeight - card.offsetHeight - 24);
    card.style.setProperty('--card-top', `${top}px`);
  });
  if (!motion.matches) deck.classList.add('deck-ready');
  paint();
}

function schedulePaint() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(paint);
  }
}

function scheduleMeasure() {
  if (!resizeQueued) {
    resizeQueued = true;
    requestAnimationFrame(measure);
  }
}

function goToCard(hash, smooth = false) {
  const index = cards.findIndex(card => `#${card.id}` === hash);
  if (index < 0) return;
  window.scrollTo({
    top: starts[index] - header.offsetHeight - 20,
    behavior: smooth && !motion.matches ? 'smooth' : 'instant'
  });
}

links.forEach(link => link.addEventListener('click', event => {
  // Preserve modified clicks and native browser tab behavior.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.pushState(null, '', link.hash);
  goToCard(link.hash, true);
}));
window.addEventListener('scroll', schedulePaint, { passive: true });
window.addEventListener('resize', scheduleMeasure);
window.addEventListener('hashchange', () => goToCard(location.hash));
document.addEventListener('portfolio:navigate-section', event => goToCard(event.detail.hash, true));
window.addEventListener('pageshow', scheduleMeasure);
motion.addEventListener('change', measure);
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(scheduleMeasure);
  cards.forEach(card => observer.observe(card));
  observer.observe(header);
}
measure();
if (location.hash) requestAnimationFrame(() => goToCard(location.hash));
document.fonts.ready.then(scheduleMeasure);
