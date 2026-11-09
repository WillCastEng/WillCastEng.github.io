(() => {
  const opening = document.querySelector('.projects-opening');
  const words = document.querySelector('.projects-manifesto');
  const drive = document.querySelector('.projects-drive');
  const video = document.querySelector('#gokart-drive');
  const workspace = document.querySelector('.project-workspace');
  const chapters = [...document.querySelectorAll('.project-chapter')];
  const links = [...document.querySelectorAll('.project-index-link')];
  const track = document.querySelector('.project-scroll-track');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  let scheduled = false;
  let finished = false;
  let fadeTimer;
  function paint() {
    scheduled = false;
    const progress = clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - innerHeight));
    if (!reduceMotion.matches) {
      const wordFade = clamp(progress / .23);
      words.style.opacity = 1 - wordFade;
      words.style.transform = `translateY(${-wordFade * 35}px) scale(${1 - wordFade * .035})`;
      drive.style.opacity = clamp((progress - .12) / .16) * (1 - clamp((progress - .8) / .2));
      drive.style.transform = `scale(${1.04 - progress * .04})`;
      const visible = opening.getBoundingClientRect().bottom > innerHeight * .4;
      if (progress < .12) {
        clearTimeout(fadeTimer);
        drive.classList.remove('drive-finished');
        video.pause();
        if (video.currentTime > 0) video.currentTime = 0;
        finished = false;
      } else if (progress >= .28 && visible && !finished && video.paused) {
        video.play().catch(() => { video.controls = true; });
      } else if (!visible) video.pause();
    } else { words.style.opacity = 1; words.style.transform = ''; }
    const top = workspace.getBoundingClientRect().top;
    document.body.classList.toggle('projects-browsing', top < innerHeight * .65);
    const listProgress = clamp(-top / Math.max(1, workspace.offsetHeight - innerHeight));
    track.style.setProperty('--project-progress', `${listProgress * 200}%`);
    track.setAttribute('aria-valuenow', Math.round(listProgress * 100));
    let active = 0;
    chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top < innerHeight * .5) active = index; });
    links.forEach((link, index) => {link.classList.toggle('is-current', index === active); if(index === active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    document.querySelector('#project-position').textContent = String(active + 1).padStart(2, '0');
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  video.muted = true;
  video.addEventListener('ended', () => {
    finished = true;
    drive.classList.add('drive-finished');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
    const bounds = opening.getBoundingClientRect();
    if (!reduceMotion.matches && bounds.top < 0 && bounds.bottom > innerHeight * .4) {
      window.scrollTo({top: workspace.offsetTop, behavior:'smooth'});
    }
    }, 850);
  });
  video.addEventListener('loadedmetadata', schedule);
  video.addEventListener('canplay', schedule);
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduceMotion.addEventListener('change', schedule);
  paint();
})();
