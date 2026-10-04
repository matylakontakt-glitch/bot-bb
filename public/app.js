const socket = io();
const galleryEl = document.getElementById("gallery");
const emptyEl = document.getElementById("empty");
const tpl = document.getElementById("cardTpl");
const uploadForm = document.getElementById("uploadForm");
const photoInput = document.getElementById("photo");
const fileLabel = document.getElementById("fileLabel");
const statusEl = document.getElementById("status");
const photoToast = document.getElementById("photoToast");
const toastAuthor = document.getElementById("toastAuthor");
const showNewest = document.getElementById("showNewest");
const clientId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
let newestCard = null;
let toastTimer = null;


document.getElementById("enterMagic").addEventListener("click",()=>{
  const welcome=document.getElementById("welcomeScreen");
  const shell=document.getElementById("appShell");
  shell.classList.remove("app-hidden");
  shell.classList.add("app-reveal");
  welcome.classList.add("portal-out");
  document.body.classList.remove("welcome-lock");
  setTimeout(()=>welcome.remove(),850);
});

document.getElementById("scrollWho").onclick=()=>document.getElementById("whoSection").scrollIntoView({behavior:"smooth"});
document.getElementById("scrollFortune").onclick=()=>document.getElementById("fortuneSection").scrollIntoView({behavior:"smooth"});
document.getElementById("openUpload").onclick=()=>document.getElementById("uploadPanel").scrollIntoView({behavior:"smooth"});

photoInput.addEventListener("change",()=>{fileLabel.textContent=photoInput.files?.[0]?.name||"Wybierz zdjęcie";});

function trimGallery(){
  const cards=[...galleryEl.children];
  cards.slice(60).forEach(el=>el.remove());
}
function addCard(item,prepend=true){
  emptyEl.style.display="none";
  const node=tpl.content.cloneNode(true);
  const article=node.querySelector(".photo-card");
  const img=node.querySelector("img");
  img.src=item.url;
  img.loading="lazy";
  img.decoding="async";
  img.alt=item.title;
  node.querySelector("h3").textContent=item.title;
  node.querySelector(".comment").textContent=item.comment;
  node.querySelector(".aura").textContent="✦ "+item.aura;
  node.querySelector(".magic").textContent="Magia "+item.magic+"/10";
  node.querySelector(".who").textContent="Dodane przez: "+item.nickname;
  prepend?galleryEl.prepend(node):galleryEl.append(node);
  trimGallery();
  newestCard = prepend ? galleryEl.firstElementChild : newestCard;
  return article;
}
socket.on("gallery:init",items=>{
  galleryEl.innerHTML="";
  items.slice(0,60).forEach(x=>addCard(x,false));
  if(!items.length)emptyEl.style.display="block";
});
socket.on("photo:new",item=>{
  addCard(item,true);
  if(item.clientId===clientId) return;
  toastAuthor.textContent=(item.nickname && item.nickname!=="Tajemniczy Gość")
    ? item.nickname+" dodał(a) nowe zdjęcie."
    : "Ktoś właśnie dodał nowy kadr.";
  photoToast.hidden=false;
  requestAnimationFrame(()=>photoToast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{
    photoToast.classList.remove("show");
    setTimeout(()=>photoToast.hidden=true,250);
  },6000);
});
showNewest.onclick=()=>{
  photoToast.classList.remove("show");
  setTimeout(()=>photoToast.hidden=true,220);
  document.getElementById("gallerySection").scrollIntoView({behavior:"smooth"});
  setTimeout(()=>newestCard?.scrollIntoView({behavior:"smooth",block:"center"}),450);
};

async function compressImage(file){
  if(!file.type.startsWith("image/")) return file;
  if(file.type==="image/gif") return file;
  const bitmap=await createImageBitmap(file);
  const maxSide=1600;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");
  canvas.width=Math.round(bitmap.width*scale);
  canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext("2d",{alpha:false});
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close?.();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",0.82));
  if(!blob) return file;
  return new File([blob],(file.name.replace(/\.[^.]+$/,"")||"zdjecie")+".jpg",{type:"image/jpeg"});
}
uploadForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const original=photoInput.files[0];
  if(!original)return;
  statusEl.textContent="Przygotowuję zdjęcie…";
  const btn=uploadForm.querySelector("button[type=submit]");
  btn.disabled=true;
  try{
    const compressed=await compressImage(original);
    const fd=new FormData();
    fd.append("photo",compressed);
    fd.append("nickname",uploadForm.elements.nickname?.value||"");
    fd.append("clientId",clientId);
    statusEl.textContent="Kula analizuje energię zdjęcia… ✦";
    const res=await fetch("/api/photos",{method:"POST",body:fd});
    if(!res.ok)throw new Error();
    uploadForm.reset();fileLabel.textContent="Wybierz zdjęcie";
    statusEl.textContent="Gotowe — kadr trafił do kroniki ✦";
  }catch{
    statusEl.textContent="Nie udało się dodać zdjęcia. Spróbuj ponownie.";
  }finally{
    btn.disabled=false;
  }
});

const whoQuestions=[
"kto częściej mówi „zaraz” i ma na myśli co najmniej pół godziny?",
"kto lepiej pamięta rocznice i ważne daty?",
"kto częściej mówi „nic mi nie jest”, kiedy ewidentnie coś jest?",
"kto szybciej zasypia podczas filmu?",
"kto częściej podjada z talerza drugiej osoby?",
"kto miałby większą szansę wygrać teleturniej?",
"kto łatwiej zagaduje obcych ludzi?",
"kto lepiej pakuje walizkę?",
"kto dłużej wybiera film na wieczór?",
"kto częściej mówi „a nie mówiłem/am”?",
"kto szybciej wybacza po sprzeczce?",
"kto częściej musi mieć ostatnie słowo?",
"kto bardziej lubi niespodzianki?",
"kto lepiej pamięta pierwszą randkę?",
"kto robi więcej zdjęć na wyjazdach?",
"kto częściej gubi telefon we własnym domu?",
"kto szybciej zaprzyjaźniłby się z sąsiadami na wakacjach?",
"kto częściej mówi „to tylko pięć minut drogi” i się myli?",
"kto bardziej lubi mieć wszystko zaplanowane?",
"kto częściej zmienia zdanie w ostatniej chwili?",
"kto byłby lepszym detektywem?",
"kto lepiej zachowuje pokerową twarz?",
"kto częściej śmieje się w najmniej odpowiednim momencie?",
"kto ma więcej cierpliwości do technologii?",
"kto pierwszy zaproponowałby spontaniczny weekend?",
"kto bardziej przeżywa finał serialu?",
"kto częściej wraca do sklepu po zapomnianą rzecz?",
"kto ma większy talent do znajdowania okazji?",
"kto częściej mówi „nie potrzebujemy tego”, a potem sam/a korzysta?",
"kto lepiej pamięta, gdzie coś zostało odłożone?",
"kto dłużej potrafi się nie odzywać po sprzeczce?",
"kto pierwszy zaczyna się śmiać podczas poważnej rozmowy?",
"kto lepiej tańczy, kiedy myśli, że nikt nie patrzy?",
"kto częściej ma rację co do ludzi po pierwszym spotkaniu?",
"kto szybciej zdecydowałby się na przeprowadzkę za granicę?",
"kto częściej przejmuje pilota?",
"kto lepiej radzi sobie z improwizacją?",
"kto częściej mówi „tylko zerknę” i znika w telefonie?",
"kto szybciej poznałby wszystkich na imprezie?",
"kto bardziej przejmuje się opinią innych?",
"kto pierwszy zadzwoniłby po pomoc przy awarii auta?",
"kto częściej próbuje coś naprawić bez instrukcji?",
"kto ma lepszą pamięć do twarzy?",
"kto szybciej zauważa, że ktoś flirtuje?",
"kto częściej zamawia deser mimo że „już nic nie zmieści”?",
"kto pierwszy powiedziałby „jedziemy!” na spontaniczny wyjazd?",
"kto lepiej pamięta teksty starych piosenek?",
"kto częściej ma tajny zapas słodyczy?",
"kto szybciej przekona drugą osobę do swojego pomysłu?",
"kto częściej mówi „zostaw, ja to zrobię”?",
"kto bardziej lubi być w centrum uwagi?",
"kto pierwszy zauważa, że druga osoba ma gorszy dzień?",
"kto częściej robi dobrą minę do złej gry?",
"kto lepiej zna drugą osobę niż ona sama siebie?",
"kto częściej mówi „nie kupujmy nic” i wraca z torbą?",
"kto szybciej odnajdzie się bez internetu przez weekend?",
"kto częściej rozpoczyna rozmowę od „mam pomysł…”?",
"kto bardziej lubi wracać do tych samych miejsc?",
"kto częściej wybiera sercem zamiast rozsądkiem?",
"kto po tej imprezie będzie miał więcej historii do opowiadania?"
];
let deck=[...whoQuestions],drawn=0,busy=false;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
deck=shuffle(deck);
function drawQuestion(){
  if(busy)return;
  busy=true;
  if(!deck.length){deck=shuffle([...whoQuestions]);drawn=0;}
  const stage=document.getElementById("deckStage");
  const reveal=document.getElementById("questionReveal");
  const card=document.getElementById("drawQuestion");
  reveal.hidden=true;
  stage.classList.remove("shuffle-now"); void stage.offsetWidth; stage.classList.add("shuffle-now");
  card.querySelector("strong").textContent="LOS TASUJE…";
  setTimeout(()=>{
    const q=deck.pop(); drawn++;
    document.getElementById("whoQuestion").textContent=q;
    document.getElementById("questionCount").textContent="Pytanie "+drawn+" z "+whoQuestions.length;
    stage.classList.remove("shuffle-now");
    reveal.hidden=false; reveal.classList.remove("reveal-now"); void reveal.offsetWidth; reveal.classList.add("reveal-now");
    card.querySelector("strong").textContent="LOSUJ PYTANIE";
    busy=false;
  },900);
}
document.getElementById("drawQuestion").onclick=drawQuestion;
document.getElementById("nextQuestion").onclick=drawQuestion;

const fortunes=[
["Zielone światło","Dziś warto powiedzieć „tak” pierwszej dobrej okazji. Spontaniczna decyzja może dać Ci więcej radości niż długi plan.","szczęśliwy znak: ✦"],
["Powrót dobrej energii","Ktoś przypomni Ci dziś, dlaczego pewne relacje są warte pielęgnowania.","szczęśliwa liczba: 7"],
["Wieczór niespodzianki","Plan może się lekko rozsypać — i bardzo dobrze. Najlepsza część dnia zacznie się przypadkiem.","szczęśliwy kolor: fiolet"],
["Mały flirt z losem","Dziś przyciągasz uwagę bardziej niż zwykle. Użyj tego z wdziękiem.","szczęśliwy znak: ☾"],
["Dzień bez poprawiania świata","Nie wszystko trzeba dziś naprawiać. Jedna rzecz pozostawiona w spokoju sama ułoży się lepiej.","szczęśliwa liczba: 4"],
["Telefon, który warto odebrać","Wiadomość lub rozmowa może zmienić ton dnia. Odpowiedz, nawet jeśli zwykle odkładasz to na później.","szczęśliwa godzina: 20:20"],
["Powiedz to wprost","Ktoś czeka dziś na prostą odpowiedź. Szczerość z odrobiną humoru będzie Twoim najlepszym zaklęciem.","szczęśliwy kolor: złoto"],
["Wieczór wspomnień","Stare zdjęcie, piosenka albo historia uruchomi dobry ciąg skojarzeń.","szczęśliwy znak: ✧"],
["Zrób coś dla siebie","Nie negocjuj dziś każdej przyjemności z kalendarzem. Mały luksus zrobi więcej dobrego, niż myślisz.","szczęśliwa liczba: 9"],
["Ktoś Cię zaskoczy","Osoba, po której się tego nie spodziewasz, zrobi dziś coś bardzo w punkt.","szczęśliwy kolor: śliwkowy"],
["Odważniejszy krok","Masz dziś więcej odwagi niż cierpliwości — wykorzystaj to do jednej rzeczy odkładanej od dawna.","szczęśliwy znak: ★"],
["Dzień dobrego żartu","Humor rozbroi dziś napięcie szybciej niż argumenty.","szczęśliwa liczba: 3"],
["Chemia w powietrzu","Dziś szczególnie liczy się kontakt z ludźmi. Rozmowa przy stole może okazać się ciekawsza niż plan dnia.","szczęśliwy kolor: burgund"],
["Nie analizuj za długo","Pierwsza intuicja będzie dziś trafniejsza niż piąta analiza.","szczęśliwa godzina: 21:11"],
["Małe zwycięstwo","Coś, co ostatnio Cię irytowało, dziś wreszcie pójdzie po Twojej myśli.","szczęśliwa liczba: 8"],
["Ktoś mówi o Tobie dobrze","Twoje imię pojawi się dziś w rozmowie w bardzo dobrym kontekście.","szczęśliwy znak: ☽"],
["Zmiana planu działa na plus","Jeśli coś zostanie przesunięte, nie walcz z tym. Powstałe okno okaże się przyjemne.","szczęśliwy kolor: granat"],
["Wieczór dla dwojga","Najlepszy moment dnia wydarzy się w małym gronie. Mniej ludzi, więcej prawdziwej rozmowy.","szczęśliwa liczba: 2"],
["Dobra wiadomość","Dziś jest dzień na wiadomość, której się nie spodziewasz.","szczęśliwy znak: ✦"],
["Magnetyczna aura","Masz dziś talent do przyciągania właściwych ludzi we właściwym momencie.","szczęśliwy kolor: ametyst"]
];
const daySel=document.getElementById("birthDay");
for(let d=1;d<=31;d++){const o=document.createElement("option");o.value=String(d).padStart(2,"0");o.textContent=d;daySel.appendChild(o);}
const yearSel=document.getElementById("birthYear");
for(let y=new Date().getFullYear()-18;y>=1930;y--){const o=document.createElement("option");o.value=y;o.textContent=y;yearSel.appendChild(o);}
document.getElementById("fortuneForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("fortuneName").value.trim();
  const d=document.getElementById("birthDay").value,m=document.getElementById("birthMonth").value,y=document.getElementById("birthYear").value;
  if(!name||!d||!m||!y)return;
  const now=new Date(),source=name.toLowerCase()+"|"+y+"-"+m+"-"+d+"|"+now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
  let hash=0;for(let i=0;i<source.length;i++)hash=((hash<<5)-hash)+source.charCodeAt(i)|0;
  const f=fortunes[Math.abs(hash)%fortunes.length];
  document.getElementById("fortuneTitle").textContent=name+", "+f[0].toLowerCase();
  document.getElementById("fortuneText").textContent=f[1];
  document.getElementById("fortuneLucky").textContent=f[2];
  const box=document.getElementById("fortuneResult");box.hidden=false;requestAnimationFrame(()=>box.classList.add("reveal"));
});