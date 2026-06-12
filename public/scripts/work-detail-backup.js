const data = window.PROJECT_DATA;

const stage     = document.getElementById("pictureStage");
const railInner = document.getElementById("textRailInner");
const rail      = document.getElementById("textRail");

// dedupe media: each unique image src OR video src gets one stacked element
const mediaKeys = [];
const mediaIdxFor = data.paragraphs.map(p => {
  const key = p.video ? `v:${p.video}` : `i:${p.image || ""}`;
  let idx = mediaKeys.indexOf(key);
  if (idx === -1) {
    mediaKeys.push(key);
    idx = mediaKeys.length - 1;
  }
  return idx;
});

// for each unique key, find the first paragraph that uses it (to get poster, etc.)
const mediaSpecs = mediaKeys.map(key => {
  const first = data.paragraphs.find(p => {
    const k = p.video ? `v:${p.video}` : `i:${p.image || ""}`;
    return k === key;
  });
  return first;
});

// build stacked media elements
const mediaEls = mediaSpecs.map((spec, i) => {
  let el;
  if (spec.video) {
    el = document.createElement("video");
    el.className = "picture-stage__video";
    el.src = spec.video;
    if (spec.poster) el.poster = spec.poster;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.preload = "metadata";
  } else {
    el = document.createElement("img");
    el.className = "picture-stage__img";
    el.src = spec.image;
    el.alt = data.title;
  }
  if (i === 0) el.classList.add("is-active");
  stage.appendChild(el);
  return el;
});

// kick off playback for the initial active video, if any
playIfVideo(mediaEls[0]);

// render paragraphs
const paraEls = data.paragraphs.map((p, i) => {
  const div = document.createElement("div");
  div.className = "paragraph-item";
  div.dataset.idx = i;
  const label = p.label ? `<div class="paragraph-item__label">${p.label}</div>` : "";
  div.innerHTML = `${label}<div class="paragraph-item__text">${p.text}</div>`;
  if (i === 0) div.classList.add("is-active");
  railInner.appendChild(div);
  return div;
});

let activePara  = 0;
let activeMedia = mediaIdxFor[0];

function update() {
  const railRect = rail.getBoundingClientRect();
  const centerY  = railRect.top + railRect.height / 2;

  let bestIdx = 0;
  let bestDist = Infinity;
  paraEls.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const c = r.top + r.height / 2;
    const d = Math.abs(c - centerY);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });

  if (bestIdx !== activePara) {
    paraEls[activePara].classList.remove("is-active");
    activePara = bestIdx;
    paraEls[activePara].classList.add("is-active");

    const newMedia = mediaIdxFor[activePara];
    if (newMedia !== activeMedia) {
      pauseIfVideo(mediaEls[activeMedia]);
      mediaEls[activeMedia].classList.remove("is-active");
      activeMedia = newMedia;
      mediaEls[activeMedia].classList.add("is-active");
      playIfVideo(mediaEls[activeMedia]);
    }
  }
}

function playIfVideo(el) {
  if (el && el.tagName === "VIDEO") {
    el.currentTime = 0;
    el.play().catch(() => {}); // ignore autoplay rejections
  }
}
function pauseIfVideo(el) {
  if (el && el.tagName === "VIDEO") el.pause();
}

let ticking = false;
rail.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => { update(); ticking = false; });
    ticking = true;
  }
});

update();