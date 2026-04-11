const panoElement = document.getElementById('pano');
const viewer = new Marzipano.Viewer(panoElement);

const view = new Marzipano.RectilinearView();
const geometry = new Marzipano.EquirectGeometry([{ width: 8000 }]);

let scenes = [];
let currentScene = null;
let currentIndex = 0;

const sidebarList = document.getElementById("sidebarList");
const timeline = document.getElementById("timeline");
const playBtn = document.getElementById("playBtn");

let autoplay = false;
let interval = null;

// 🔥 LADATAAN JSON
fetch("weeks.json")
.then(res => res.json())
.then(data => {
scenes = data;


buildUI();
initViewer();


});

// 🔥 LUO UI
function buildUI() {
scenes.forEach((scene, index) => {


// SIDEBAR
const sideItem = document.createElement("div");
sideItem.className = "item";
sideItem.dataset.index = index;
sideItem.textContent = scene.label;
sidebarList.appendChild(sideItem);

// TIMELINE
const timeItem = document.createElement("div");
timeItem.className = "item";
timeItem.dataset.index = index;

timeItem.innerHTML = `
  <div class="dot"></div>
  <div class="label">${scene.label}</div>
`;

timeline.appendChild(timeItem);


});
}

// 🔥 INIT VIEWER
function initViewer() {
currentScene = createScene(0);
currentScene.switchTo();

attachEvents();
}

// 🔥 SCENE
function createScene(index) {
const source = Marzipano.ImageUrlSource.fromString("pano/" + scenes[index].file);

return viewer.createScene({
source,
geometry,
view
});
}

// 🔥 NAVIGOINTI
function goTo(index) {
if (index === currentIndex) return;

const newScene = createScene(index);
newScene.switchTo();

currentScene = newScene;
currentIndex = index;

updateUI(index);
}

// 🔥 UI UPDATE
function updateUI(index) {
document.querySelectorAll(".item").forEach(i => {
if (parseInt(i.dataset.index) === index) {
i.classList.add("active");
} else {
i.classList.remove("active");
}
});
}

// 🔥 EVENTS
function attachEvents() {
document.querySelectorAll(".item").forEach(item => {
item.onclick = () => {
stopAutoplay();
goTo(parseInt(item.dataset.index));
};
});
}

// 🔥 AUTOPLAY
playBtn.onclick = () => {
if (autoplay) {
stopAutoplay();
return;
}

autoplay = true;
playBtn.textContent = "❚❚ Pause";

interval = setInterval(() => {
let next = currentIndex + 1;
if (next >= scenes.length) next = 0;
goTo(next);
}, 5000);
};

function stopAutoplay() {
autoplay = false;
clearInterval(interval);
playBtn.textContent = "▶ Play";
}
