const detail   = document.querySelector(".thought-detail");
const wrap     = document.getElementById("thoughtBodyWrap");
const body     = document.getElementById("thoughtBody");
const tocList  = document.getElementById("tocList");

const headings = [...body.querySelectorAll("h2")];

if (headings.length === 0) {
  detail.classList.add("no-toc");
} else {
  headings.forEach((h, i) => {
    if (!h.id) h.id = slugify(h.textContent) || `section-${i + 1}`;
  });

  const tocEls = headings.map((h, i) => {
    const li = document.createElement("li");
    li.className = "toc__item";
    li.dataset.target = h.id;
    li.textContent = h.textContent;
    if (i === 0) li.classList.add("is-active");
    li.addEventListener("click", () => {
      const wrapTop = wrap.getBoundingClientRect().top;
      const hTop    = h.getBoundingClientRect().top;
      wrap.scrollBy({ top: hTop - wrapTop - 20, behavior: "smooth" });
    });
    tocList.appendChild(li);
    return li;
  });

  let activeIdx = 0;
  const TOP_OFFSET = 80;

  function updateActive() {
    const wrapTop = wrap.getBoundingClientRect().top;
    let current = 0;
    for (let i = 0; i < headings.length; i++) {
      const top = headings[i].getBoundingClientRect().top - wrapTop;
      if (top - TOP_OFFSET <= 0) {
        current = i;
      } else {
        break;
      }
    }
    if (current !== activeIdx) {
      tocEls[activeIdx].classList.remove("is-active");
      activeIdx = current;
      tocEls[activeIdx].classList.add("is-active");
    }
  }

  let ticking = false;
  wrap.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateActive();
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}