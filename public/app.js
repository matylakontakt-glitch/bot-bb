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
const spinAgain = document.getElementById("spinAgain");
const popover = document.getElementById("taskPopover");
const taskBig = document.getElementById("taskBig");

document.getElementById("openUpload").onclick = () => document.getElementById("uploadPanel").scrollIntoView({behavior:"smooth"});
document.getElementById("scrollWheel").onclick = () => document.getElementById("wheelSection").scrollIntoView({behavior:"smooth"});
document.getElementById("scrollFortune").onclick = () => document.getElementById("fortuneSection").scrollIntoView({behavior:"smooth"});

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
    setTimeout(()=>document.getElementById("gallerySection").scrollIntoView({behavior:"smooth"}),450);
  } catch {
    statusEl.textContent="Nie udało się dodać zdjęcia. Spróbuj ponownie.";
  } finally {
    btn.disabled=false;
  }
});

const wheelOptions = [
  "Patrzcie sobie w oczy przez 15 sekund. Kto pierwszy się roześmieje — przegrywa.",
  "Każde z Was mówi jedną rzecz, za którą dziś najbardziej lubi drugą osobę.",
  "Odtwórzcie miną moment, kiedy pierwszy raz się zobaczyliście.",
  "Zatańczcie 20 sekund do muzyki, której jeszcze nie słychać.",
  "Zróbcie zdjęcie jak para z okładki bardzo drogiego magazynu.",
  "Jedno z Was szepcze komplement. Drugie musi odpowiedzieć jeszcze lepszym.",
  "Wybierzcie inną parę i zróbcie wspólne zdjęcie jak po 20 latach przyjaźni.",
  "Powiedzcie równocześnie, kto częściej ma rację. Bez konsultacji.",
  "Jedno z Was wymyśla tytuł filmu o Waszym związku. Drugie dodaje slogan reklamowy.",
  "Przez 30 sekund zamieńcie się rolami i naśladujcie siebie nawzajem.",
  "Wypijcie po małym łyku tego, co macie w kieliszku lub szklance.",
  "Wybierzcie drugą parę do wspólnego toastu i wznieście toast za najlepszą decyzję tego roku."
];

const colors=["#5b167f","#8d2bb8","#3b0c53","#af58df","#6d178f","#c27af0","#47105e","#942ec1","#5a116f","#b660df","#351044","#7d219f"];
wheel.style.background = `conic-gradient(${colors.map((c,i)=>`${c} ${i*30}deg ${(i+1)*30}deg`).join(",")})`;

const labels=document.getElementById("wheelLabels");
wheelOptions.forEach((_,i)=>{
  const d=document.createElement("span");
  d.textContent=i+1;
  const angle=i*30+15;
  d.style.transform=`rotate(${angle}deg) translateY(-185px) rotate(${-angle}deg)`;
  labels.appendChild(d);
});

let rotation=0;
function showTask(text){
  taskBig.textContent=text;
  popover.hidden=false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(()=>popover.classList.add("show"));
}
function closeTask(){
  popover.classList.remove("show");
  document.body.classList.remove("modal-open");
  setTimeout(()=>popover.hidden=true,220);
}
document.getElementById("doneTask").onclick=closeTask;

function spinWheel(){
  if(spinBtn.disabled) return;
  spinBtn.disabled=true;
  const idx=Math.floor(Math.random()*wheelOptions.length);
  const segment=360/wheelOptions.length;
  const targetCenter=idx*segment + segment/2;
  const currentNorm=((rotation%360)+360)%360;
  const delta=(360-targetCenter-currentNorm+360)%360;
  rotation += 1440 + delta;
  wheel.style.transform=`rotate(${rotation}deg)`;
  labels.style.transform=`rotate(${rotation}deg)`;
  setTimeout(()=>{
    showTask(wheelOptions[idx]);
    spinBtn.disabled=false;
  },4300);
}
spinBtn.onclick=spinWheel;
spinAgain.onclick=()=>{closeTask(); setTimeout(spinWheel,260);};

const fortunes = [
  ["Zielone światło","Dziś warto powiedzieć „tak” pierwszej dobrej okazji. Spontaniczna decyzja może dać Ci więcej radości niż długi plan.","szczęśliwy znak: ✦"],
  ["Powrót dobrej energii","Ktoś przypomni Ci dziś, dlaczego pewne relacje są warte pielęgnowania. Nie udawaj obojętności.","szczęśliwa liczba: 7"],
  ["Wieczór niespodzianki","Plan może się lekko rozsypać — i bardzo dobrze. Najlepsza część dnia zacznie się przypadkiem.","szczęśliwy kolor: fiolet"],
  ["Mały flirt z losem","Dziś przyciągasz uwagę bardziej niż zwykle. Użyj tego z wdziękiem, nie z instrukcją obsługi.","szczęśliwy znak: ☾"],
  ["Dzień bez poprawiania świata","Nie wszystko trzeba dziś naprawiać. Jedna rzecz pozostawiona w spokoju sama ułoży się lepiej.","szczęśliwa liczba: 4"],
  ["Telefon, który warto odebrać","Wiadomość lub rozmowa może zmienić ton dnia. Odpowiedz, nawet jeśli zwykle odkładasz to na później.","szczęśliwa godzina: 20:20"],
  ["Powiedz to wprost","Ktoś czeka dziś na prostą odpowiedź. Szczerość z odrobiną humoru będzie Twoim najlepszym zaklęciem.","szczęśliwy kolor: złoto"],
  ["Wieczór wspomnień","Stare zdjęcie, piosenka albo historia uruchomi dobry ciąg skojarzeń. Daj sobie chwilę nostalgii.","szczęśliwy znak: ✧"],
  ["Zrób coś tylko dla siebie","Nie negocjuj dziś każdej przyjemności z kalendarzem. Mały luksus zrobi więcej dobrego, niż myślisz.","szczęśliwa liczba: 9"],
  ["Ktoś Cię zaskoczy","Osoba, po której się tego nie spodziewasz, zrobi dziś coś bardzo w punkt. Zauważ to i powiedz o tym.","szczęśliwy kolor: śliwkowy"],
  ["Odważniejszy krok","Masz dziś więcej odwagi niż cierpliwości — wykorzystaj to do jednej rzeczy, którą odkładasz od dawna.","szczęśliwy znak: ★"],
  ["Dzień dobrego żartu","Humor rozbroi dziś napięcie szybciej niż argumenty. Jedna zabawna odpowiedź może uratować wieczór.","szczęśliwa liczba: 3"],
  ["Chemia w powietrzu","Dziś szczególnie liczy się kontakt z ludźmi. Rozmowa przy stole może okazać się ciekawsza niż cały plan dnia.","szczęśliwy kolor: burgund"],
  ["Nie analizuj za długo","Pierwsza intuicja będzie dziś trafniejsza niż piąta analiza. Zaufaj sobie trochę wcześniej.","szczęśliwa godzina: 21:11"],
  ["Małe zwycięstwo","Coś, co ostatnio Cię irytowało, dziś wreszcie pójdzie po Twojej myśli. Celebruj nawet drobne sukcesy.","szczęśliwa liczba: 8"],
  ["Ktoś mówi o Tobie dobrze","Twoje imię pojawi się dziś w rozmowie w bardzo dobrym kontekście. Nie musisz niczego udowadniać.","szczęśliwy znak: ☽"],
  ["Zmiana planu działa na plus","Jeśli coś zostanie odwołane albo przesunięte, nie walcz z tym. Powstałe okno okaże się bardzo przyjemne.","szczęśliwy kolor: granat"],
  ["Wieczór dla dwojga","Najlepszy moment dnia wydarzy się w małym gronie. Mniej ludzi, więcej prawdziwej rozmowy.","szczęśliwa liczba: 2"],
  ["Dobra wiadomość","Dziś jest dzień na wiadomość, której się nie spodziewasz. Zanim odpowiesz, uśmiechnij się.","szczęśliwy znak: ✦"],
  ["Magnetyczna aura","Masz dziś talent do przyciągania właściwych ludzi we właściwym momencie. Nie chowaj się w kącie.","szczęśliwy kolor: ametyst"]
];

const daySel=document.getElementById("birthDay");
for(let d=1;d<=31;d++){const o=document.createElement("option");o.value=String(d).padStart(2,"0");o.textContent=d;daySel.appendChild(o);}
const yearSel=document.getElementById("birthYear");
for(let y=new Date().getFullYear()-18;y>=1930;y--){const o=document.createElement("option");o.value=y;o.textContent=y;yearSel.appendChild(o);}

document.getElementById("fortuneForm").addEventListener("submit",e=>{
  e.preventDefault();
  const d=document.getElementById("birthDay").value;
  const m=document.getElementById("birthMonth").value;
  const y=document.getElementById("birthYear").value;
  if(!d||!m||!y)return;
  const raw=`${y}-${m}-${d}`;
  const today=new Date();
  const todayKey=`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  const source=raw+"|"+todayKey;
  let hash=0;
  for(let i=0;i<source.length;i++) hash=((hash<<5)-hash)+source.charCodeAt(i)|0;
  const fortune=fortunes[Math.abs(hash)%fortunes.length];
  document.getElementById("fortuneTitle").textContent=fortune[0];
  document.getElementById("fortuneText").textContent=fortune[1];
  document.getElementById("fortuneLucky").textContent=fortune[2];
  const box=document.getElementById("fortuneResult");
  box.hidden=false;
  requestAnimationFrame(()=>box.classList.add("reveal"));
});
