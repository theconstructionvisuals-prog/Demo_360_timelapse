const panoElement = document.getElementById('pano');
const viewer = new Marzipano.Viewer(panoElement);

const view = new Marzipano.RectilinearView();
const geometry = new Marzipano.EquirectGeometry([{ width: 8000 }]);

let scenes = [];
let currentIndex = 0;
let currentScene = null;

const timeline = document.getElementById("timeline");

/* =========================
   CACHE (🔥 iso parannus)
========================= */

let sceneCache = {};
let imageCache = {};

/* =========================
   PRELOAD
========================= */

function preloadImage(index) {
  if (index < 0 || index >= scenes.length) return;
  if (imageCache[index]) return;

  const img = new Image();
  img.src = "pano/" + scenes[index].file;

  imageCache[index] = img;
}

function preloadAround(index) {
  preloadImage(index);
  preloadImage(index - 1);
  preloadImage(index + 1);
}

/* =========================
   LOAD DATA
========================= */

fetch("weeks.json")
  .then(res => res.json())
  .then(data => {
    scenes = data;
    buildUI();
    init();
  });

/* =========================
   BUILD UI
========================= */

function buildUI() {
  scenes.forEach((scene, index) => {
    const item = document.createElement("div");
    item.className = "item";
    item.dataset.index = index;

    item.innerHTML = `
      <div class="dot"></div>
      <div class="label">${scene.label}</div>
    `;

    item.onclick = () => goTo(index);

    timeline.appendChild(item);
  });
}

/* =========================
   INIT
========================= */

function init() {
  currentScene = createScene(0);
  currentScene.switchTo();

  updateUI(0);
  preloadAround(0);
}

/* =========================
   CREATE SCENE (cache!)
========================= */

function createScene(index) {

  if (sceneCache[index]) return sceneCache[index];

  const source = Marzipano.ImageUrlSource.fromString("pano/" + scenes[index].file);

  const scene = viewer.createScene({
    source,
    geometry,
    view
  });

  sceneCache[index] = scene;
  return scene;
}

/* =========================
   NAVIGATION
========================= */

function goTo(index) {

  if (index === currentIndex) return;

  // STOP autoplay jos käyttäjä klikkaa
  if (playing) {
    playing = false;
    clearInterval(interval);
    playBtn.innerHTML = "▶";
  }

  const scene = createScene(index);
  scene.switchTo();

  currentScene = scene;
  currentIndex = index;

  updateUI(index);
  preloadAround(index);
}

/* =========================
   UI UPDATE
========================= */

function updateUI(index) {
  document.querySelectorAll(".item").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.index) === index);
  });
}

/* =========================
   PLAY / PAUSE
========================= */

let playing = false;
let interval = null;

const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
  playing = !playing;

  if (playing) {
    playBtn.innerHTML = "❚❚";

    interval = setInterval(() => {
      let next = currentIndex + 1;

      if (next >= scenes.length) {
        next = 0;
      }

      goTo(next);

    }, 2000);

  } else {
    playBtn.innerHTML = "▶";
    clearInterval(interval);
  }
});
