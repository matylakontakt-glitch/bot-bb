const socket = io();
const galleryEl = document.getElementById("gallery");
const emptyEl = document.getElementById("empty");
const tpl = document.getElementById("cardTpl");
const uploadForm = document.getElementById("uploadForm");
const photoInput = document.getElementById("photo");
const fileLabel = document.getElementById("fileLabel");
const statusEl = document.getElementById("status");

document.getElementById("enterMagic").onclick = () => {
  const screen=document.getElementById("welcomeScreen");
  screen.classList.add("leave");
  document.body.classList.remove("welcome-lock");
  setTimeout(()=>screen.remove(),750);
};

document.getElementById("openUpload").onclick = () => document.getElementById("uploadPanel").scrollIntoView({behavior:"smooth"});
document.getElementById("scrollWho").onclick = () => document.getElementById("whoSection").scrollIntoView({behavior:"smooth"});
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

const whoQuestions = [
  "kto częściej mówi „zaraz” i ma na myśli co najmniej pół godziny?",
  "kto pierwszy zauważa, że w domu skończyła się kawa?",
  "kto częściej kupuje coś, czego absolutnie nie planował kupić?",
  "kto lepiej pamięta daty, rocznice i urodziny?",
  "kto częściej mówi „nic mi nie jest”, kiedy ewidentnie coś jest?",
  "kto szybciej zasypia podczas filmu?",
  "kto częściej wybiera restaurację, a potem zamawia to samo co zawsze?",
  "kto lepiej udaje, że słucha instrukcji obsługi?",
  "kto częściej mówi „nie jestem głodny/a”, a potem podjada z talerza drugiej osoby?",
  "kto miałby większą szansę wygrać teleturniej?",
  "kto częściej rozpoczyna rozmowę z obcymi ludźmi?",
  "kto lepiej radzi sobie z pakowaniem walizki?",
  "kto najdłużej wybiera, co obejrzeć wieczorem?",
  "kto częściej mówi „a nie mówiłem/am”?",
  "kto szybciej wybacza po sprzeczce?",
  "kto częściej ma ostatnie słowo?",
  "kto bardziej lubi niespodzianki?",
  "kto częściej sprawdza prognozę pogody, zanim wyjdzie z domu?",
  "kto lepiej pamięta pierwszą randkę?",
  "kto częściej robi zdjęcia na wyjazdach?",
  "kto ma większy talent do zgubienia telefonu we własnym domu?",
  "kto szybciej zaprzyjaźniłby się z sąsiadami na wakacjach?",
  "kto częściej mówi „to tylko pięć minut drogi” i kompletnie się myli?",
  "kto bardziej lubi planować wszystko z wyprzedzeniem?",
  "kto częściej zmienia zdanie w ostatniej chwili?",
  "kto byłby lepszym detektywem?",
  "kto lepiej zachowuje pokerową twarz?",
  "kto częściej śmieje się w najmniej odpowiednim momencie?",
  "kto ma więcej cierpliwości do technologii?",
  "kto pierwszy zaproponowałby spontaniczny weekend bez planu?",
  "kto bardziej przeżywa finał serialu?",
  "kto częściej wraca do sklepu po coś, czego zapomniał?",
  "kto ma większy talent do znajdowania promocji?",
  "kto częściej mówi „nie potrzebujemy tego”, a potem sam/a z tego korzysta?",
  "kto lepiej pamięta, gdzie coś zostało odłożone?",
  "kto dłużej potrafi się nie odzywać po sprzeczce?",
  "kto pierwszy zaczyna się śmiać podczas poważnej rozmowy?",
  "kto lepiej tańczy, kiedy myśli, że nikt nie patrzy?",
  "kto częściej ma rację co do ludzi po pierwszym spotkaniu?",
  "kto szybciej zdecydowałby się na przeprowadzkę do innego kraju?",
  "kto częściej przejmuje pilota do telewizora?",
  "kto lepiej radzi sobie z improwizacją?",
  "kto częściej mówi „ja tylko zerknę” i znika w telefonie na 20 minut?",
  "kto szybciej poznałby wszystkich na tej imprezie?",
  "kto bardziej przejmuje się tym, co powiedzą inni?",
  "kto pierwszy zadzwoniłby po pomoc, gdyby auto odmówiło współpracy?",
  "kto częściej próbuje naprawić coś samodzielnie zamiast czytać instrukcję?",
  "kto ma lepszą pamięć do twarzy?",
  "kto szybciej zorientuje się, że ktoś flirtuje?",
  "kto częściej zamawia deser mimo słów „ja już nic nie zmieszczę”?",
  "kto pierwszy powiedziałby „jedziemy!” na spontaniczny wyjazd?",
  "kto lepiej pamięta teksty starych piosenek?",
  "kto częściej ma tajny zapas słodyczy?",
  "kto szybciej przekona drugą osobę do swojego pomysłu?",
  "kto częściej mówi „zostaw, ja to zrobię”?",
  "kto bardziej lubi być w centrum uwagi?",
  "kto pierwszy zauważa, że druga osoba ma gorszy dzień?",
  "kto częściej robi dobrą minę do złej gry?",
  "kto lepiej zna drugą osobę niż ona sama siebie?",
  "kto po tej imprezie będzie miał więcej historii do opowiadania?"
];

let whoState={p1:"",p2:"",order:[],index:0,s1:0,s2:0,both:0};

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function renderQuestion(){
  if(whoState.index>=whoState.order.length){
    document.getElementById("whoQuestion").textContent="Koniec talii. Chyba wiecie o sobie już trochę za dużo.";
    document.getElementById("questionNo").textContent=whoState.order.length;
    return;
  }
  const card=document.getElementById("whoCard");
  card.classList.remove("flip-in");
  void card.offsetWidth;
  card.classList.add("flip-in");
  document.getElementById("whoQuestion").textContent=whoState.order[whoState.index];
  document.getElementById("questionNo").textContent=whoState.index+1;
}
function updateScore(){
  document.getElementById("scoreOne").textContent=whoState.s1;
  document.getElementById("scoreTwo").textContent=whoState.s2;
  document.getElementById("scoreBoth").textContent=whoState.both;
}
function answer(type){
  if(type==="one") whoState.s1++;
  if(type==="two") whoState.s2++;
  if(type==="both") whoState.both++;
  updateScore();
  whoState.index++;
  renderQuestion();
}

document.getElementById("whoSetup").addEventListener("submit",e=>{
  e.preventDefault();
  const p1=document.getElementById("playerOne").value.trim();
  const p2=document.getElementById("playerTwo").value.trim();
  if(!p1||!p2)return;
  whoState={p1,p2,order:shuffle(whoQuestions),index:0,s1:0,s2:0,both:0};
  document.getElementById("voteOne").textContent=p1;
  document.getElementById("voteTwo").textContent=p2;
  document.getElementById("scoreOneName").textContent=p1;
  document.getElementById("scoreTwoName").textContent=p2;
  document.getElementById("questionTotal").textContent=whoQuestions.length;
  document.getElementById("whoSetup").hidden=true;
  document.getElementById("whoGame").hidden=false;
  updateScore();
  renderQuestion();
});
document.getElementById("voteOne").onclick=()=>answer("one");
document.getElementById("voteTwo").onclick=()=>answer("two");
document.getElementById("voteBoth").onclick=()=>answer("both");
document.getElementById("nextQuestion").onclick=()=>{whoState.index++;renderQuestion();};

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
  const name=document.getElementById("fortuneName").value.trim();
  const d=document.getElementById("birthDay").value;
  const m=document.getElementById("birthMonth").value;
  const y=document.getElementById("birthYear").value;
  if(!name||!d||!m||!y)return;
  const raw=`${y}-${m}-${d}`;
  const today=new Date();
  const todayKey=`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  const source=(name.toLowerCase()+"|"+raw+"|"+todayKey);
  let hash=0;
  for(let i=0;i<source.length;i++) hash=((hash<<5)-hash)+source.charCodeAt(i)|0;
  const fortune=fortunes[Math.abs(hash)%fortunes.length];
  document.getElementById("fortuneTitle").textContent=name+", "+fortune[0].toLowerCase();
  document.getElementById("fortuneText").textContent=fortune[1];
  document.getElementById("fortuneLucky").textContent=fortune[2];
  const box=document.getElementById("fortuneResult");
  box.hidden=false;
  requestAnimationFrame(()=>box.classList.add("reveal"));
});