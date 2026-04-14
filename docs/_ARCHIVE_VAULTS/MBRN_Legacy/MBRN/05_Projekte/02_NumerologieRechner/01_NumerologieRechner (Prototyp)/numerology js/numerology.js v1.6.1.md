/* numerology.js v1.6.1 FIXED
Basis: stabile v1.5.7

Neue Zahlen:
- Geburtstagszahl
- Reifezahl
- Balancezahl

Bestehende Zahlen bleiben:
- Lebenszahl
- Seelenzahl
- Ausdruckszahl
- Persönlichkeitszahl
- Karmische Zahl
- Persönliches Jahr
*/

/* PYTHAGORAS */

const pythagorasTable = {
  1:['A','J','S'],
  2:['B','K','T'],
  3:['C','L','U'],
  4:['D','M','V'],
  5:['E','N','W'],
  6:['F','O','X'],
  7:['G','P','Y'],
  8:['H','Q','Z'],
  9:['I','R']
};


/* ERKLÄRUNGEN */

const explanations = {

life:{
1:"Neuanfang, Führungsqualitäten, Selbstbestimmung",
2:"Harmonie, Kooperation, Sensibilität",
3:"Kreativität, Ausdruck, Kommunikation",
4:"Stabilität, Ordnung, Disziplin",
5:"Flexibilität, Abenteuer, Veränderung",
6:"Verantwortung, Familie, Fürsorge",
7:"Analyse, Rückzug, Weisheit",
8:"Macht, Erfolg, materielles Geschick",
9:"Abschluss, Mitgefühl, Idealismus",
11:"Intuition & Inspiration (Master 11)",
22:"Master-Builder: Vision & Realisierung (Master 22)",
33:"Lehrer/Heiler (Master 33)"
},

soul:{
1:"Innerer Antrieb",
2:"Sehnsucht nach Harmonie",
3:"Bedürfnis nach kreativem Ausdruck",
4:"Sicherheit & Struktur",
5:"Sehnsucht nach Freiheit",
6:"Fürsorge",
7:"Spirituelle Suche",
8:"Starker Wille",
9:"Empathie",
11:"Spirituelle Sensibilität",
22:"Visionäre Kraft",
33:"Dienst am Kollektiv"
},

expression:{
1:"Direkter Ausdruck",
2:"Diplomatisch",
3:"Kommunikativ",
4:"Pragmatisch",
5:"Vielseitig",
6:"Verantwortungsvoll",
7:"Analytisch",
8:"Ambitioniert",
9:"Inspirierend",
11:"Inspirierende Persönlichkeit",
22:"Großer Umsetzer",
33:"Heilende Persönlichkeit"
},

personality:{
1:"Wirkt unabhängig",
2:"Wirkt freundlich",
3:"Wirkt offen",
4:"Wirkt stabil",
5:"Wirkt lebhaft",
6:"Wirkt warm",
7:"Wirkt ruhig",
8:"Wirkt stark",
9:"Wirkt empathisch",
11:"Besondere Ausstrahlung",
22:"Visionär",
33:"Sehr fürsorglich"
},

karmic:{
1:"Karmische Lektion: Eigeninitiative",
2:"Karmische Lektion: Partnerschaft",
3:"Karmische Lektion: Ausdruck",
4:"Karmische Lektion: Verantwortung",
5:"Karmische Lektion: Freiheit",
6:"Karmische Lektion: Fürsorge",
7:"Karmische Lektion: Innere Arbeit",
8:"Karmische Lektion: Macht",
9:"Karmische Lektion: Loslassen"
},

personalYear:{
1:"Neubeginn",
2:"Beziehungen",
3:"Kreativität",
4:"Arbeit & Struktur",
5:"Veränderung",
6:"Familie",
7:"Reflexion",
8:"Karriere",
9:"Abschluss",
11:"Intuitives Jahr",
22:"Großes Umsetzungsjahr",
33:"Dienst am Kollektiv"
},

birthday:{
1:"Geborener Anführer",
2:"Diplomatisches Talent",
3:"Kreatives Talent",
4:"Praktisches Talent",
5:"Abenteuerlust",
6:"Fürsorge",
7:"Denker",
8:"Management Talent",
9:"Humanitäres Talent"
},

maturity:{
1:"Reife durch Selbstständigkeit",
2:"Reife durch Kooperation",
3:"Reife durch Kreativität",
4:"Reife durch Struktur",
5:"Reife durch Freiheit",
6:"Reife durch Verantwortung",
7:"Reife durch Erkenntnis",
8:"Reife durch Macht",
9:"Reife durch Mitgefühl",
11:"Spirituelle Reife",
22:"Große Manifestation",
33:"Spiritueller Dienst"
},

balance:{
1:"Balance durch Eigenständigkeit",
2:"Balance durch Diplomatie",
3:"Balance durch Kommunikation",
4:"Balance durch Ordnung",
5:"Balance durch Anpassung",
6:"Balance durch Verantwortung",
7:"Balance durch Rückzug",
8:"Balance durch Selbstkontrolle",
9:"Balance durch Mitgefühl"
}

};


/* UTIL */

function normalizeName(name){
return name.toUpperCase()
.replace(/Ä/g,'AE')
.replace(/Ö/g,'OE')
.replace(/Ü/g,'UE')
.replace(/ß/g,'SS');
}

function getNumberForChar(char){
for(let num in pythagorasTable){
if(pythagorasTable[num].includes(char)) return parseInt(num,10);
}
return 0;
}

function reducePreserveMaster(num){

if(num===0) return 0;

if([11,22,33].includes(num)) return num;

while(num>9){

num=(''+num)
.split('')
.reduce((s,d)=>s+parseInt(d,10),0);

if([11,22,33].includes(num)) break;
}

return num;
}

function reduceForceSingle(num){

if(num===0) return 0;

while(num>9){

num=(''+num)
.split('')
.reduce((s,d)=>s+parseInt(d,10),0);

}

return num;
}

function formatNormalAndMaster(sum){

const normal=reduceForceSingle(sum);
const master=reducePreserveMaster(sum);

if([11,22,33].includes(master) && master!==normal){
return normal+"/"+master;
}

return normal.toString();
}

function quersumme(num){
return (''+num)
.split('')
.map(d=>parseInt(d,10))
.reduce((a,b)=>a+(isNaN(b)?0:b),0);
}

/* DATUM VALIDIERUNG */

function isValidDateDDMMYYYY(dateStr){
  if(!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
  const parts=dateStr.split('.');
  const day=parseInt(parts[0],10);
  const month=parseInt(parts[1],10);
  const year=parseInt(parts[2],10);
  if(month<1||month>12) return false;
  if(year<1900||year>2099) return false;
  const monthLengths=[31,(isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31];
  if(day<1||day>monthLengths[month-1]) return false;
  return true;
}

function isLeapYear(y){return (y%4===0 && y%100!==0) || (y%400===0);}


/* NAMENSZAHLEN */

function calculateExpressionSum(name){
  const s=normalizeName(name).replace(/\s+/g,'');
  let sum=0;
  for(let ch of s) sum+=getNumberForChar(ch);
  return sum;
}

function calculateSoulSum(name){
  const s=normalizeName(name).replace(/\s+/g,'');
  let sum=0;
  for(let ch of s) if('AEIOU'.includes(ch)) sum+=getNumberForChar(ch);
  return sum;
}

function calculatePersonalitySum(name){
  const s=normalizeName(name).replace(/\s+/g,'');
  let sum=0;
  for(let ch of s) if(!'AEIOU'.includes(ch)) sum+=getNumberForChar(ch);
  return sum;
}


/* LEBENSZAHL */

function calculateLifeSum(date){
  const digits=date.replace(/\D/g,'');
  let sum=0;
  for(let d of digits) sum+=parseInt(d,10);
  return sum;
}

/* NEUE ZAHLEN: Geburtstag, Reife, Balance */

function calculateBirthdaySum(date){
  return parseInt(date.split('.')[0],10);
}

function calculateMaturitySum(lifeSum,expressionSum){
  return reduceForceSingle(lifeSum)+reduceForceSingle(expressionSum);
}

function calculateBalanceSum(name){
  const parts=normalizeName(name).split(' ');
  let sum=0;
  for(let p of parts){
    if(p.length>0) sum+=getNumberForChar(p[0]);
  }
  return sum;
}

/* KARMISCHE ZAHL */

function calculateKarmicSum(expressionSum){
  const exprNormal=reduceForceSingle(expressionSum);
  const all=[1,2,3,4,5,6,7,8,9];
  const missing=all.filter(n=>n!==exprNormal);
  return missing.reduce((a,b)=>a+b,0);
}

/* PERSÖNLICHES JAHR */

function calculatePersonalYearClassic(lifeNormal){
  const yearQs=quersumme(new Date().getFullYear());
  return lifeNormal+yearQs;
}

function calculatePersonalYearMasterCandidate(lifeNormal){
  return lifeNormal+new Date().getFullYear();
}


/* DOM / UI HELPERS */

function setResultText(elementId,text){
  const el=document.getElementById(elementId);
  if(!el) return;
  el.textContent=text;
  el.classList.remove('master');
  let master=parseInt(text.includes('/')?text.split('/')[1]:text,10);
  if([11,22,33].includes(master)) el.classList.add('master');
}

function setTileExplanation(tileId,displayValue,type){
  const el=document.getElementById(tileId);
  if(!el) return;
  const explMap=explanations[type]||{};
  const base=displayValue.includes('/')?parseInt(displayValue.split('/')[0],10):parseInt(displayValue,10);
  const master=displayValue.includes('/')?parseInt(displayValue.split('/')[1],10):null;
  let text=explMap[base]||'';
  if(master && explMap[master]) text+=(text?' — ':'')+explMap[master];
  el.textContent=text;
}

function addExtraNumber(title,displayValue,tooltip='',explanationType=null,explanationKey=null){
  const grid=document.getElementById('extraNumbersGrid');
  if(!grid) return;
  const tile=document.createElement('div');
  tile.classList.add('result-tile');

  const titleDiv=document.createElement('div');
  titleDiv.classList.add('result-title');
  titleDiv.textContent=title;
  if(tooltip){
    const tip=document.createElement('button');
    tip.classList.add('tooltip');
    tip.setAttribute('title',tooltip);
    tip.setAttribute('aria-hidden','true');
    tip.textContent='ℹ️';
    titleDiv.appendChild(tip);
  }

  const valueDiv=document.createElement('div');
  valueDiv.classList.add('result-value');
  valueDiv.textContent=displayValue;
  if(displayValue.includes('/')){
    const master=parseInt(displayValue.split('/')[1],10);
    if([11,22,33].includes(master)) valueDiv.classList.add('master');
  } else {
    const n=parseInt(displayValue,10);
    if([11,22,33].includes(n)) valueDiv.classList.add('master');
  }

  const explDiv=document.createElement('div');
  explDiv.classList.add('result-explanation');
  if(explanationType && explanationKey!==null){
    const explMap=explanations[explanationType]||{};
    const base=parseInt(displayValue.split('/')[0],10);
    const master=displayValue.includes('/')?parseInt(displayValue.split('/')[1],10):null;
    let text=explMap[base]||'';
    if(master && explMap[master]) text+=(text?' — ':'')+explMap[master];
    explDiv.textContent=text;
  }

  tile.appendChild(titleDiv);
  tile.appendChild(valueDiv);
  tile.appendChild(explDiv);
  grid.appendChild(tile);
}

/* MAIN */

document.addEventListener('DOMContentLoaded',function(){

const form=document.getElementById('numerologyForm');
if(!form) return;

const nameInput=document.getElementById('name');
const dateInput=document.getElementById('birthdate');
const nameErrEl=document.getElementById('nameError');
const dateErrEl=document.getElementById('dateError');
const calcBtn=document.getElementById('calcBtn');
const resetBtn=document.getElementById('resetBtn');

function validateName(name){
  if(!name||!name.trim()) return {ok:false,msg:'Bitte Name eingeben.'};
  const pattern=/^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/;
  if(!pattern.test(name)) return {ok:false,msg:'Nur Buchstaben, Leerzeichen, - und \' erlaubt.'};
  if(!/[A-Za-zÄÖÜäöüßẞ]/.test(name)) return {ok:false,msg:'Bitte einen gültigen Namen eingeben.'};
  return {ok:true,msg:''};
}

function updateFormState(){
  const nstate=validateName(nameInput.value);
  const dstate=isValidDateDDMMYYYY(dateInput.value.trim());
  if(nstate.ok){nameInput.classList.remove('input-invalid');nameInput.classList.add('input-valid');nameErrEl.textContent='';}
  else{nameInput.classList.add('input-invalid');nameInput.classList.remove('input-valid');nameErrEl.textContent=nstate.msg;}
  if(dstate){dateInput.classList.remove('input-invalid');dateInput.classList.add('input-valid');dateErrEl.textContent='';}
  else{dateInput.classList.add('input-invalid');dateInput.classList.remove('input-valid');if(dateInput.value.trim()) dateErrEl.textContent='TT.MM.JJJJ Format erforderlich.'; else dateErrEl.textContent='';}
  const valid=nstate.ok&&dstate;
  if(calcBtn) calcBtn.disabled=!valid;
  return valid;
}

nameInput?.addEventListener('input',updateFormState);
dateInput?.addEventListener('input',updateFormState);

resetBtn?.addEventListener('click',function(){
  nameErrEl.textContent=''; dateErrEl.textContent='';
  nameInput.classList.remove('input-invalid','input-valid');
  dateInput.classList.remove('input-invalid','input-valid');
  setResultText('personalityNumber','');
  setResultText('soulNumber','');
  setResultText('expressionNumber','');
  setResultText('lifePathNumber','');
  const extra=document.getElementById('extraNumbersGrid');
  if(extra) extra.innerHTML='';
  if(calcBtn) calcBtn.disabled=false;
});


form.addEventListener('submit',function(e){
  e.preventDefault();
  if(!updateFormState()) return;

  const name=nameInput.value.trim();
  const date=dateInput.value.trim();

  const expressionSum=calculateExpressionSum(name);
  const soulSum=calculateSoulSum(name);
  const personalitySum=calculatePersonalitySum(name);
  const lifeSum=calculateLifeSum(date);

  const expression=formatNormalAndMaster(expressionSum);
  const soul=formatNormalAndMaster(soulSum);
  const personality=formatNormalAndMaster(personalitySum);
  const life=formatNormalAndMaster(lifeSum);

  setResultText('expressionNumber',expression);
  setResultText('soulNumber',soul);
  setResultText('personalityNumber',personality);
  setResultText('lifePathNumber',life);

  setTileExplanation('expressionExplanation',expression,'expression');
  setTileExplanation('soulExplanation',soul,'soul');
  setTileExplanation('personalityExplanation',personality,'personality');
  setTileExplanation('lifeExplanation',life,'life');

  const extraGrid=document.getElementById('extraNumbersGrid');
  if(extraGrid) extraGrid.innerHTML='';

  /* Karmische Zahl */
  const karmicSum=calculateKarmicSum(expressionSum);
  const karmicDisplay=formatNormalAndMaster(karmicSum);
  addExtraNumber('Karmische Zahl',karmicDisplay,'Karmische Lektionen / Herausforderungen','karmic',karmicSum);

  /* Persönliches Jahr */
  const lifeNormal=reduceForceSingle(lifeSum);
  const personalClassicSum=calculatePersonalYearClassic(lifeNormal);
  const personalClassicDisplay=formatNormalAndMaster(personalClassicSum);
  const personalMasterCandidateSum=calculatePersonalYearMasterCandidate(lifeNormal);
  const personalMasterCandidate=reducePreserveMaster(personalMasterCandidateSum);
  let personalDisplay=personalClassicDisplay;
  if([11,22,33].includes(personalMasterCandidate) && personalMasterCandidate!==parseInt(personalClassicDisplay,10)){
    const normalPart=reduceForceSingle(personalClassicSum);
    personalDisplay=`${normalPart}/${personalMasterCandidate}`;
  }
  addExtraNumber('Persönliches Jahr',personalDisplay,'Lebenszahl + Jahresquersumme','personalYear',null);

  /* Geburtstagszahl */
  const birthday=formatNormalAndMaster(calculateBirthdaySum(date));
  addExtraNumber('Geburtstagszahl',birthday,'Tag des Geburtsdatums','birthday',null);

  /* Reifezahl */
  const maturity=formatNormalAndMaster(calculateMaturitySum(lifeSum,expressionSum));
  addExtraNumber('Reifezahl',maturity,'Lebenszahl + Ausdruckszahl','maturity',null);

  /* Balancezahl */
  const balance=formatNormalAndMaster(calculateBalanceSum(name));
  addExtraNumber('Balancezahl',balance,'Anfangsbuchstaben der Namen','balance',null);

  console.log('v1.6.1 Berechnung',{
    expressionSum,soulSum,personalitySum,lifeSum,
    expression,soul,personality,life,
    karmicDisplay,personalDisplay,birthday,maturity,balance
  });

});

updateFormState();

});