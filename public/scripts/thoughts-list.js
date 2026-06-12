const list  = document.getElementById("thoughtsList");
const stage = document.getElementById("previewStage");
const data  = [...window.THOUGHTS_DATA].sort((a, b) => b.date.localeCompare(a.date));

// preload cover images (one stacked element per thought)
const imgEls = data.map((t) => {
  if (!t.cover) return null;
  const img = document.createElement("img");
  img.className = "thoughts__preview-img";
  img.src = t.cover;
  img.alt = t.title;
  stage.appendChild(img);
  return img;
});

// render rows
const rowEls = data.map((t, i) => {
  const row = document.createElement("li");
  row.className = "thought-row";
  row.dataset.idx = i;
  row.innerHTML = `
    <span class="thought-row__title">${t.title}</span>
    <span class="thought-row__date">${formatDate(t.date)}</span>
  `;
  row.addEventListener("mouseenter", () => setPreview(i));
  row.addEventListener("mouseleave", () => clearPreview());
  row.addEventListener("click", () => {
    location.href = `/thoughts/${t.id}/`;
  });
  list.appendChild(row);
  return row;
});

let activeImg = -1;

function setPreview(idx) {
  const img = imgEls[idx];
  if (!img) return;
  if (activeImg >= 0 && imgEls[activeImg]) imgEls[activeImg].classList.remove("is-active");
  img.classList.add("is-active");
  activeImg = idx;
}

function clearPreview() {
  if (activeImg >= 0 && imgEls[activeImg]) imgEls[activeImg].classList.remove("is-active");
  activeImg = -1;
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[+m - 1]} ${+d}, ${y}`;
}