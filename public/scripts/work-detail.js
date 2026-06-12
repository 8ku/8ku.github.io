const data = window.PROJECT_DATA;

const stage     = document.getElementById("pictureStage");
const railInner = document.getElementById("textRailInner");
const rail      = document.getElementById("textRail");

function mediaKey(p) {
  if (p.model) return `m:${p.model}`;
  if (p.video) return `v:${p.video}`;
  return `i:${p.image || ""}`;
}

const mediaKeys = [];
const mediaIdxFor = data.paragraphs.map(p => {
  const key = mediaKey(p);
  let idx = mediaKeys.indexOf(key);
  if (idx === -1) {
    mediaKeys.push(key);
    idx = mediaKeys.length - 1;
  }
  return idx;
});

const mediaSpecs = mediaKeys.map(key =>
  data.paragraphs.find(p => mediaKey(p) === key)
);

const mediaEls = mediaSpecs.map((spec, i) => {
  let el;
  if (spec.model) {
    el = document.createElement("div");
    el.className = "picture-stage__model";
    el.dataset.modelUrl = spec.model;
    el.dataset.customCanvas = spec.customCanvas || "";
    el._modelInitialized = false;
  } else if (spec.video) {
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

activateMedia(mediaEls[0]);

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
      deactivateMedia(mediaEls[activeMedia]);
      mediaEls[activeMedia].classList.remove("is-active");
      activeMedia = newMedia;
      mediaEls[activeMedia].classList.add("is-active");
      activateMedia(mediaEls[activeMedia]);
    }
  }
}

function activateMedia(el) {
  if (!el) return;
  if (el.tagName === "VIDEO") {
    el.currentTime = 0;
    el.play().catch(() => {});
  } else if (el.classList.contains("picture-stage__model")) {
    initModelOnce(el);
  }
}

function deactivateMedia(el) {
  if (!el) return;
  if (el.tagName === "VIDEO") el.pause();
}

async function initModelOnce(el) {
  if (el._modelInitialized) return;
  el._modelInitialized = true;
  const scriptUrl = el.dataset.customCanvas;
  const modelUrl  = el.dataset.modelUrl;
  if (!scriptUrl) return;
  try {
    const mod = await import(scriptUrl);
    if (typeof mod.init === "function") {
      mod.init(el, modelUrl);
    } else {
      console.error("customCanvas module has no init() export:", scriptUrl);
    }
  } catch (err) {
    console.error("Failed to load 3D module:", scriptUrl, err);
  }
}

let ticking = false;
rail.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => { update(); ticking = false; });
    ticking = true;
  }
});

update();