// later this is fetched: const projects = await fetch('/data/projects.json').then(r => r.json());
const projects = window.PROJECTS_DATA || [];

const stage    = document.getElementById("coverStage");
const list     = document.getElementById("projectsList");
const viewport = document.getElementById("projectsViewport");

// ... rest of the file stays exactly the same

// --- render
const imgs = projects.map((p, i) => {
  const img = document.createElement("img");
  img.className = "cover__img";
  img.src = p.cover;
  img.alt = p.title;
  if (i === 0) img.classList.add("is-active");
  stage.appendChild(img);
  return img;
});

const items = projects.map((p, i) => {
  const li = document.createElement("li");
  li.className = "project";
  li.dataset.idx = i;
  li.innerHTML = `
    <span class="project__name">${p.title}</span>
    <span class="project__dot">·</span>
    <span class="project__year">${p.year}</span>
  `;
  if (i === 0) li.classList.add("is-active");
  list.appendChild(li);
  return li;
});

// --- active state
let activeIdx = 0;
let hovering  = false;

function setActive(next) {
  next = ((next % projects.length) + projects.length) % projects.length;
  if (next === activeIdx) return;
  imgs[activeIdx].classList.remove("is-active");
  items[activeIdx].classList.remove("is-active");
  activeIdx = next;
  imgs[activeIdx].classList.add("is-active");
  items[activeIdx].classList.add("is-active");
  if (!hovering) centerItem(items[activeIdx]);
}

function centerItem(el) {
  const v = viewport.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const delta = (r.top - v.top) - (v.height - r.height) / 2;
  viewport.scrollBy({ top: delta, behavior: "smooth" });
}

// --- autoplay
const AUTOPLAY_MS = 2600;
let autoplayId = null;
const startAutoplay = () => {
  stopAutoplay();
  autoplayId = setInterval(() => setActive(activeIdx + 1), AUTOPLAY_MS);
};
const stopAutoplay = () => {
  if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
};

// --- hover: highlight + pause autoplay
items.forEach(item => {
  item.addEventListener("mouseenter", () => {
    hovering = true;
    stopAutoplay();
    setActive(+item.dataset.idx);
  });
item.addEventListener("click", () => {
  const project = projects[+item.dataset.idx];
  location.href = `/works/${project.id}/index.html`;
});
});

viewport.addEventListener("mouseleave", () => {
  hovering = false;
  startAutoplay();
});

// --- edge auto-scroll: cursor near top scrolls list up; near bottom scrolls down
const EDGE_ZONE = 90;   // px from edge where scrolling activates
const MAX_SPEED = 9;    // px per frame at the very edge
let cursorY = null;
let rafId   = null;

viewport.addEventListener("mousemove", (e) => {
  cursorY = e.clientY;
  if (!rafId) rafId = requestAnimationFrame(tick);
});
viewport.addEventListener("mouseleave", () => {
  cursorY = null;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
});

function tick() {
  rafId = null;
  if (cursorY === null) return;

  const rect       = viewport.getBoundingClientRect();
  const fromTop    = cursorY - rect.top;
  const fromBottom = rect.bottom - cursorY;

  let dy = 0;
  if (fromTop < EDGE_ZONE)        dy = -MAX_SPEED * (1 - fromTop / EDGE_ZONE);
  else if (fromBottom < EDGE_ZONE) dy =  MAX_SPEED * (1 - fromBottom / EDGE_ZONE);

  if (dy) viewport.scrollTop += dy;

  rafId = requestAnimationFrame(tick);
}

// pause autoplay when tab is hidden
document.addEventListener("visibilitychange", () => {
  document.hidden ? stopAutoplay() : startAutoplay();
});

startAutoplay();