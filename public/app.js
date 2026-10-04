const socket = io();
const galleryEl = document.getElementById("gallery");
const emptyEl = document.getElementById("empty");
const tpl = document.getElementById("cardTpl");
const uploadForm = document.getElementById("uploadForm");
const photoInput = document.getElementById("photo");
const fileLabel = document.getElementById("fileLabel");
const statusEl = document.getElementById("status");
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const wheelResult = document.getElementById("wheelResult");

document.getElementById("openUpload").onclick = () => document.getElementById("uploadPanel").scrollIntoView({behavior:"smooth"});
document.getElementById("scrollWheel").onclick = () => document.getElementById("wheelSection").scrollIntoView({behavior:"smooth"});

photoInput.addEventListener("change", () => {
  fileLabel.textContent = photoInput.files?.[0]?.name || "Wybierz zdjęcie";
});

function addCard(item, prepend=true){
  emptyEl.style.display="none";
  const node = tpl.content.cloneNode(true);
  node.querySelector("img").src = item.url;
  node.querySelector("img").alt = item.title;
  node.querySelector("h3").textContent = item.title;
  node.querySelector(".comment").textContent = item.comment;
  node.querySelector(".aura").textContent = "✦ " + item.aura;
  node.querySelector(".magic").textContent = "Magia " + item.magic + "/10";
  node.querySelector(".who").textContent = "Dodane przez: " + item.nickname;
  if(prepend) galleryEl.prepend(node); else galleryEl.append(node);
}

socket.on("gallery:init", items => {
  galleryEl.innerHTML="";
  items.forEach(x => addCard(x,false));
  if(!items.length) emptyEl.style.display="block";
});
socket.on("photo:new", item => addCard(item,true));

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if(!photoInput.files[0]) return;
  const fd = new FormData(uploadForm);
  statusEl.textContent = "Kula analizuje energię zdjęcia… ✦";
  const btn = uploadForm.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    const res = await fetch("/api/photos",{method:"POST",body:fd});
    if(!res.ok) throw new Error();
    uploadForm.reset();
    fileLabel.textContent="Wybierz zdjęcie";
    statusEl.textContent="Gotowe — kadr trafił do kroniki ✦";
    setTimeout(()=>document.getElementById("gallerySection").scrollIntoView({behavior:"smooth"}),500);
  } catch {
    statusEl.textContent="Nie udało się dodać zdjęcia. Spróbuj ponownie.";
  } finally {
    btn.disabled=false;
  }
});

const wheelOptions = [
  "Zrób selfie z osobą w fiolecie",
  "Nadaj komuś magiczny pseudonim",
  "Wybierz duet do zdjęcia",
  "Powiedz komuś komplement",
  "Zatańcz przez 20 sekund",
  "Łyk dowolnego napoju",
  "Znajdź osobę spod tego samego znaku zodiaku",
  "Zrób zdjęcie jak okładkę albumu"
];
let rotation=0;
spinBtn.onclick = () => {
  spinBtn.disabled=true;
  const idx=Math.floor(Math.random()*wheelOptions.length);
  rotation += 1440 + idx*45 + 22;
  wheel.style.transform=`rotate(${rotation}deg)`;
  wheelResult.textContent="Koło wiruje…";
  setTimeout(()=>{
    wheelResult.textContent=wheelOptions[idx];
    spinBtn.disabled=false;
  },4300);
};
