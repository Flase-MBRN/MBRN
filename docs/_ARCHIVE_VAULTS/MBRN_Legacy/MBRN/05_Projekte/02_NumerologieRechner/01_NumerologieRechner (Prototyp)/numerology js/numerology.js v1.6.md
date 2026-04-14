/* numerology.js v1.6
Erweiterung der stabilen v1.5.7

Neue Zahlen:
- Geburtstagszahl
- Reifezahl
- Balancezahl
*/

const pythagorasTable = {
1:['A','J','S'],2:['B','K','T'],3:['C','L','U'],4:['D','M','V'],
5:['E','N','W'],6:['F','O','X'],7:['G','P','Y'],8:['H','Q','Z'],9:['I','R']
};

/* ERKLÄRUNGEN */

const explanations = {

life:{1:"Neuanfang, Führungsqualitäten",2:"Harmonie, Kooperation",3:"Kreativität & Kommunikation",
4:"Stabilität, Ordnung",5:"Flexibilität, Abenteuer",6:"Verantwortung, Familie",
7:"Analyse, Weisheit",8:"Macht & Erfolg",9:"Mitgefühl, Idealismus",
11:"Intuition & Inspiration",22:"Vision & Realisierung",33:"Lehrer / Heiler"},

soul:{1:"Innerer Antrieb",2:"Bedürfnis nach Harmonie",3:"Kreativer Ausdruck",
4:"Sicherheit & Struktur",5:"Freiheit",6:"Fürsorge",7:"Spirituelle Suche",
8:"Starker Wille",9:"Empathie",11:"Spirituelle Sensibilität",22:"Visionär",33:"Dienst am Kollektiv"},

expression:{1:"Direkter Ausdruck",2:"Diplomatisch",3:"Kommunikativ",4:"Pragmatisch",
5:"Vielseitig",6:"Verantwortungsvoll",7:"Analytisch",8:"Ambitioniert",
9:"Inspirierend",11:"Inspirierende Persönlichkeit",22:"Großer Umsetzer",33:"Heilende Persönlichkeit"},

personality:{1:"Wirkt unabhängig",2:"Wirkt freundlich",3:"Wirkt offen",
4:"Wirkt stabil",5:"Wirkt lebhaft",6:"Wirkt warm",7:"Wirkt ruhig",
8:"Wirkt stark",9:"Wirkt empathisch",11:"Besondere Ausstrahlung",22:"Visionär",33:"Sehr fürsorglich"},

karmic:{1:"Lektion: Selbstständigkeit",2:"Lektion: Empathie",3:"Lektion: Ausdruck",
4:"Lektion: Verantwortung",5:"Lektion: Freiheit",6:"Lektion: Fürsorge",
7:"Lektion: innere Entwicklung",8:"Lektion: Macht richtig nutzen",9:"Lektion: Loslassen"},

personalYear:{1:"Neubeginn",2:"Beziehungen",3:"Kreativität",4:"Arbeit & Struktur",
5:"Veränderung",6:"Familie",7:"Reflexion",8:"Karriere",9:"Abschluss",
11:"Intuitives Jahr",22:"Großes Umsetzungsjahr",33:"Dienst am Kollektiv"},

birthday:{1:"Geborener Anführer",2:"Diplomatisches Talent",3:"Kreatives Talent",
4:"Praktisches Talent",5:"Abenteuerlust",6:"Fürsorge",7:"Denker",
8:"Management Talent",9:"Humanitäres Talent"},

maturity:{1:"Reife durch Selbstständigkeit",2:"Reife durch Kooperation",
3:"Reife durch Kreativität",4:"Reife durch Struktur",5:"Reife durch Freiheit",
6:"Reife durch Verantwortung",7:"Reife durch Erkenntnis",8:"Reife durch Macht",
9:"Reife durch Mitgefühl",11:"Spirituelle Reife",22:"Große Manifestation",33:"Spiritueller Dienst"},

balance:{1:"Balance durch Eigenständigkeit",2:"Balance durch Diplomatie",
3:"Balance durch Kommunikation",4:"Balance durch Ordnung",
5:"Balance durch Anpassung",6:"Balance durch Verantwortung",
7:"Balance durch inneren Rückzug",8:"Balance durch Selbstkontrolle",
9:"Balance durch Mitgefühl"}
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
if(pythagorasTable[num].includes(char)) return parseInt(num);
}
return 0;
}

function reduceForceSingle(num){
while(num>9){
num=(''+num).split('').reduce((a,b)=>a+parseInt(b),0);
}
return num;
}

function reducePreserveMaster(num){
if([11,22,33].includes(num)) return num;

while(num>9){
num=(''+num).split('').reduce((a,b)=>a+parseInt(b),0);
if([11,22,33].includes(num)) break;
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

/* NAMEN */

function calculateExpressionSum(name){
let sum=0;
for(let c of normalizeName(name)){
sum+=getNumberForChar(c);
}
return sum;
}

function calculateSoulSum(name){
let sum=0;
for(let c of normalizeName(name)){
if("AEIOU".includes(c)) sum+=getNumberForChar(c);
}
return sum;
}

function calculatePersonalitySum(name){
let sum=0;
for(let c of normalizeName(name)){
if(!"AEIOU".includes(c)) sum+=getNumberForChar(c);
}
return sum;
}

/* DATUM */

function calculateLifeSum(date){
let digits=date.replace(/\D/g,'');
let sum=0;
for(let d of digits) sum+=parseInt(d);
return sum;
}

function calculateBirthdaySum(date){
let day=parseInt(date.split('.')[0]);
return day;
}

/* NEUE ZAHLEN */

function calculateMaturitySum(lifeSum,expressionSum){
return reduceForceSingle(lifeSum)+reduceForceSingle(expressionSum);
}

function calculateBalanceSum(name){
const parts=normalizeName(name).split(' ');
let sum=0;

for(let p of parts){
if(p.length>0){
sum+=getNumberForChar(p[0]);
}
}
return sum;
}

/* DOM */

function setResult(id,val){
const el=document.getElementById(id);
if(!el) return;

el.textContent=val;

el.classList.remove('master');

if(val.includes('/')){
const m=parseInt(val.split('/')[1]);
if([11,22,33].includes(m)) el.classList.add('master');
}
}

function setExplanation(id,val,type){
const el=document.getElementById(id);
if(!el) return;

let base=val.includes('/')?parseInt(val.split('/')[0]):parseInt(val);

el.textContent=explanations[type][base]||"";
}

function addExtra(title,value,type){

const grid=document.getElementById("extraNumbersGrid");

const tile=document.createElement("div");
tile.className="result-tile";

tile.innerHTML=`
<div class="result-title">${title}</div>
<div class="result-value">${value}</div>
<div class="result-explanation">${explanations[type][parseInt(value)]||""}</div>
`;

grid.appendChild(tile);
}

/* MAIN */

document.addEventListener("DOMContentLoaded",function(){

const form=document.getElementById("numerologyForm");

form.addEventListener("submit",function(e){

e.preventDefault();

const name=document.getElementById("name").value.trim();
const date=document.getElementById("birthdate").value.trim();

const expressionSum=calculateExpressionSum(name);
const soulSum=calculateSoulSum(name);
const personalitySum=calculatePersonalitySum(name);
const lifeSum=calculateLifeSum(date);

const expression=formatNormalAndMaster(expressionSum);
const soul=formatNormalAndMaster(soulSum);
const personality=formatNormalAndMaster(personalitySum);
const life=formatNormalAndMaster(lifeSum);

setResult("expressionNumber",expression);
setResult("soulNumber",soul);
setResult("personalityNumber",personality);
setResult("lifePathNumber",life);

setExplanation("expressionExplanation",expression,"expression");
setExplanation("soulExplanation",soul,"soul");
setExplanation("personalityExplanation",personality,"personality");
setExplanation("lifeExplanation",life,"life");

const extra=document.getElementById("extraNumbersGrid");
extra.innerHTML="";

/* Geburtstagszahl */

const birthday=formatNormalAndMaster(calculateBirthdaySum(date));
addExtra("Geburtstagszahl",birthday,"birthday");

/* Reifezahl */

const maturity=formatNormalAndMaster(calculateMaturitySum(lifeSum,expressionSum));
addExtra("Reifezahl",maturity,"maturity");

/* Balancezahl */

const balance=formatNormalAndMaster(calculateBalanceSum(name));
addExtra("Balancezahl",balance,"balance");

});

});