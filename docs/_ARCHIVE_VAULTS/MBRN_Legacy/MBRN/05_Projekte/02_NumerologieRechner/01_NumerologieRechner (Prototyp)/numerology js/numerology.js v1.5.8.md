/* numerology.js v1.5.8

   Erweiterung von v1.5.7

   - Alle bisherigen Zahlen bleiben erhalten

   - Erklärungstexte integriert

   - Skalierbar für weitere Zahlen

*/

  

document.addEventListener("DOMContentLoaded", function(){

  

    /* -------------------------

    PYTHAGORAS BUCHSTABEN

    ------------------------- */

    const pythagorasMap = {

    A:1,J:1,S:1,

    B:2,K:2,T:2,

    C:3,L:3,U:3,

    D:4,M:4,V:4,

    E:5,N:5,W:5,

    F:6,O:6,X:6,

    G:7,P:7,Y:7,

    H:8,Q:8,Z:8,

    I:9,R:9

    };

    /* -------------------------

    ERKLÄRUNGEN

    ------------------------- */

    const explanations = {

    life:{

    1:"Neuanfang, Eigenständigkeit",

    2:"Harmonie, Partnerschaft",

    3:"Kreativität, Ausdruck",

    4:"Struktur, Stabilität",

    5:"Flexibilität, Abenteuer, Veränderung",

    6:"Verantwortung, Familie",

    7:"Analyse, Weisheit",

    8:"Erfolg, Macht",

    9:"Mitgefühl, Abschluss",

    11:"Intuition, Inspiration",

    22:"Master Builder",

    33:"Spiritueller Lehrer"

    },

    soul:{

    1:"Starker innerer Wille",

    2:"Sensibel, harmoniebedürftig",

    3:"Kreativer Selbstausdruck",

    4:"Innerer Wunsch nach Ordnung",

    5:"Freiheitsdrang",

    6:"Bedürfnis zu helfen",

    7:"Suche nach Wahrheit",

    8:"Streben nach Erfolg",

    9:"Hohe Empathie, Wunsch nach Dienst",

    11:"Spirituelle Sensibilität",

    22:"Große Visionen",

    33:"Liebe und Mitgefühl"

    },

    expression:{

    1:"Direkter Ausdruck, Self-Starter",

    2:"Diplomatisch",

    3:"Kommunikativ",

    4:"Methodisch",

    5:"Vielseitig",

    6:"Verantwortungsvoll",

    7:"Analytisch",

    8:"Führungsstark",

    9:"Inspirierend, visionär",

    11:"Inspirierende Persönlichkeit",

    22:"Strategischer Macher",

    33:"Lehrende Persönlichkeit"

    },

    personality:{

    1:"Eindruck: unabhängig",

    2:"Eindruck: freundlich, verbindlich",

    3:"Eindruck: kreativ",

    4:"Eindruck: zuverlässig",

    5:"Eindruck: freiheitsliebend",

    6:"Eindruck: fürsorglich",

    7:"Eindruck: geheimnisvoll",

    8:"Eindruck: durchsetzungsstark",

    9:"Eindruck: mitfühlend, charismatisch",

    11:"Eindruck: inspirierend",

    22:"Eindruck: strategisch",

    33:"Eindruck: weise"

    },

    karmic:{

    1:"Karmische Lektion: Selbstständigkeit",

    2:"Karmische Lektion: Zusammenarbeit",

    3:"Karmische Lektion: Ausdruck",

    4:"Karmische Lektion: Struktur",

    5:"Karmische Lektion: Freiheit",

    6:"Karmische Lektion: Verantwortung",

    7:"Karmische Lektion: Erkenntnis",

    8:"Karmische Lektion: Macht & Umgang damit",

    9:"Karmische Lektion: Loslassen & Dienst"

    },

    personalYear:{

    1:"Neubeginn",

    2:"Partnerschaft",

    3:"Kreativität",

    4:"Arbeit, Struktur",

    5:"Veränderung",

    6:"Familie",

    7:"Innere Entwicklung",

    8:"Karriere",

    9:"Abschluss",

    11:"Intuition verstärkt",

    22:"Große Projekte",

    33:"Spirituelle Phase"

    }

    };

    /* -------------------------

    HILFSFUNKTIONEN

    ------------------------- */

    function normalizeName(name){

    return name

    .toUpperCase()

    .replace(/Ä/g,"AE")

    .replace(/Ö/g,"OE")

    .replace(/Ü/g,"UE")

    .replace(/ß/g,"SS")

    .replace(/[^A-Z]/g,"");

    }

    function reduceNumber(num){

    if(num===11||num===22||num===33) return num;

    while(num>9){

    num = num.toString().split("").reduce((a,b)=>a+Number(b),0);

    if(num===11||num===22||num===33) break;

    }

    return num;

    }

    function reduceWithMaster(num){

    let master = num;

    while(master>9){

    master = master.toString().split("").reduce((a,b)=>a+Number(b),0);

    }

    if(num===11||num===22||num===33){

    let base = num.toString().split("").reduce((a,b)=>a+Number(b),0);

    return base+"/"+num;

    }

    return reduceNumber(num);

    }

    /* -------------------------

    NAMENSZAHLEN

    ------------------------- */

    function calculateExpression(name){

    let sum=0;

    for(let char of name){

    if(pythagorasMap[char]) sum+=pythagorasMap[char];

    }

    return sum;

    }

    function calculateSoul(name){

    let vowels=["A","E","I","O","U"];

    let sum=0;

    for(let char of name){

    if(vowels.includes(char)){

    sum+=pythagorasMap[char];

    }

    }

    return sum;

    }

    function calculatePersonality(name){

    let vowels=["A","E","I","O","U"];

    let sum=0;

    for(let char of name){

    if(!vowels.includes(char)){

    sum+=pythagorasMap[char];

    }

    }

    return sum;

    }

    /* -------------------------

    LEBENSZAHL

    ------------------------- */

    function calculateLife(date){

    let digits=date.replace(/\D/g,"");

    let sum=0;

    for(let d of digits){

    sum+=Number(d);

    }

    return sum;

    }

    /* -------------------------

    PERSÖNLICHES JAHR

    ------------------------- */

    function calculatePersonalYear(date){

    let today=new Date();

    let year=today.getFullYear();

    let [day,month]=date.split(".");

    let sum =

    Number(day) +

    Number(month) +

    Number(year.toString().slice(-2));

    return sum;

    }

    /* -------------------------

    KARMISCHE ZAHL

    ------------------------- */

    function calculateKarmic(expression){

    return reduceNumber(expression);

    }

    /* -------------------------

    AUSGABE HELFER

    ------------------------- */

    function setNumber(id,value){

    let el=document.getElementById(id);

    if(!el) return;

    el.textContent=value;

    if(value===11||value===22||value===33){

    el.classList.add("master");

    }else{

    el.classList.remove("master");

    }

    }

    function setExplanation(id,type,value){

    let el=document.getElementById(id+"Explanation");

    if(!el) return;

    let base = typeof value==="string"

    ? Number(value.split("/")[0])

    : value;

    let text = explanations[type][base] || "";

    el.textContent=text;

    }

    /* -------------------------

    FORMULAR

    ------------------------- */

    let form=document.getElementById("numerologyForm");

    form.addEventListener("submit",function(e){

    e.preventDefault();

    let nameInput=document.getElementById("name").value;

    let dateInput=document.getElementById("birthdate").value;

    let name=normalizeName(nameInput);

    /* Kernzahlen */

    let expressionRaw=calculateExpression(name);

    let soulRaw=calculateSoul(name);

    let personalityRaw=calculatePersonality(name);

    let lifeRaw=calculateLife(dateInput);

    /* Reduktion */

    let expression=reduceWithMaster(expressionRaw);

    let soul=reduceWithMaster(soulRaw);

    let personality=reduceWithMaster(personalityRaw);

    let life=reduceWithMaster(lifeRaw);

    /* Extra */

    let karmic=reduceNumber(expressionRaw);

    let personalYear=reduceWithMaster(calculatePersonalYear(dateInput));

    /* Anzeige */

    setNumber("expressionNumber",expression);

    setNumber("soulNumber",soul);

    setNumber("personalityNumber",personality);

    setNumber("lifePathNumber",life);

    /* Extra Grid */

    let extraGrid=document.getElementById("extraNumbersGrid");

    extraGrid.innerHTML="";

    function addExtra(title,value,type){

    let tile=document.createElement("div");

    tile.className="result-tile";

    tile.innerHTML=`

    <div class="result-title">${title}</div>

    <div class="result-value">${value}</div>

    <div class="result-explanation">${explanations[type][Number(value)]||""}</div>

    `;

    extraGrid.appendChild(tile);

    }

    addExtra("Karmische Zahl",karmic,"karmic");

    addExtra("Persönliches Jahr",personalYear,"personalYear");

    /* Erklärungen */

    setExplanation("expressionNumber","expression",expression);

    setExplanation("soulNumber","soul",soul);

    setExplanation("personalityNumber","personality",personality);

    setExplanation("lifePathNumber","life",life);

    });

    });