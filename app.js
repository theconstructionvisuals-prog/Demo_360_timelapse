const panoElement = document.getElementById('pano');
const viewer = new Marzipano.Viewer(panoElement);

const view = new Marzipano.RectilinearView();
const geometry = new Marzipano.EquirectGeometry([{ width: 8000 }]);

let scenes = [];
let currentIndex = 0;
let currentScene = null;

const timeline = document.getElementById("timeline");
const sidebarList = document.getElementById("sidebarList");

let leftSpacer, rightSpacer;

// LOAD
fetch("weeks.json")
.then(res => res.json())
.then(data => {
scenes = data;
buildUI();
init();
});

// BUILD
function buildUI() {

leftSpacer = document.createElement("div");
rightSpacer = document.createElement("div");

leftSpacer.style.flex = "0 0 auto";
rightSpacer.style.flex = "0 0 auto";

timeline.appendChild(leftSpacer);

scenes.forEach((scene, index) => {

// SIDEBAR ITEM
const sideItem = document.createElement("div");
sideItem.className = "item";
sideItem.dataset.index = index;
sideItem.textContent = scene.label;
sidebarList.appendChild(sideItem);

// TIMELINE ITEM
const item = document.createElement("div");
item.className = "item";
item.dataset.index = index;

item.innerHTML =
  '<div class="dot"></div>' +
  '<div class="label">' + scene.label + '</div>';

timeline.appendChild(item);

});

timeline.appendChild(rightSpacer);
}

// INIT
function init() {
updateSpacers();

currentScene = createScene(0);
currentScene.switchTo();

attachEvents();

requestAnimationFrame(() => {
centerItem(0);
});
}

// SPACERS
function updateSpacers() {
const first = document.querySelector("#timeline .item");
if (!first) return;

const itemWidth = first.offsetWidth;
const spacerWidth = (window.innerWidth / 2) - (itemWidth / 2);

leftSpacer.style.width = spacerWidth + "px";
rightSpacer.style.width = spacerWidth + "px";
}

// SCENE
function createScene(index) {
const source = Marzipano.ImageUrlSource.fromString("pano/" + scenes[index].file);

return viewer.createScene({
source,
geometry,
view
});
}

// NAV
function goTo(index) {
if (index === currentIndex) return;

const scene = createScene(index);
scene.switchTo();

currentScene = scene;
currentIndex = index;

updateUI(index);
centerItem(index);
}

// UI UPDATE
function updateUI(index) {
document.querySelectorAll(".item").forEach(el => {
el.classList.toggle("active", parseInt(el.dataset.index) === index);
});
}

// CENTER
function centerItem(index) {

const item = document.querySelector('#timeline .item[data-index="' + index + '"]');
if (!item) return;

const target =
item.offsetLeft - (timeline.clientWidth / 2) + (item.offsetWidth / 2);

timeline.scrollTo({
left: target,
behavior: "smooth"
});
}

// EVENTS
function attachEvents() {

document.querySelectorAll(".item").forEach(item => {
item.onclick = () => {
goTo(parseInt(item.dataset.index));
};
});

// DRAG
let isDown = false;
let startX;
let scrollLeft;

timeline.addEventListener("mousedown", e => {
isDown = true;
startX = e.pageX;
scrollLeft = timeline.scrollLeft;
});

timeline.addEventListener("mouseup", () => isDown = false);
timeline.addEventListener("mouseleave", () => isDown = false);

timeline.addEventListener("mousemove", e => {
if (!isDown) return;
timeline.scrollLeft = scrollLeft - (e.pageX - startX);
});

window.addEventListener("resize", () => {
updateSpacers();
centerItem(currentIndex);
});
}
