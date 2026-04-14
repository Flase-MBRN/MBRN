/* numerology.js v1.5.6 - Kernzahlen + Masterzahlen + erklärbare Deutung */
const pythagorasTable = {
    1:['A','J','S'], 2:['B','K','T'], 3:['C','L','U'], 4:['D','M','V'],
    5:['E','N','W'], 6:['F','O','X'], 7:['G','P','Y'], 8:['H','Q','Z'], 9:['I','R']
};

// Erklärungen für jede Zahl pro Typ
const explanations = {
    life: {
        1:"Neuanfang, Führungsqualitäten, Selbstbestimmung",
        2:"Harmonie, Kooperation, Sensibilität",
        3:"Kreativität, Ausdruck, Kommunikation",
        4:"Stabilität, Ordnung, Disziplin",
        5:"Flexibilität, Abenteuer, Veränderung",
        6:"Verantwortung, Familie, Fürsorge",
        7:"Analyse, Rückzug, Weisheit",
        8:"Macht, Erfolg, Struktur",
        9:"Abschluss, Mitgefühl, Idealismus",
        11:"Intuition, Inspiration, Vision",
        22:"Master-Builder, Visionär, Realisierung",
        33:"Lehrer, Heilung, Universalität"
    },
    soul: {},
    expression: {},
    personality: {}
};

// defensive DOMContentLoaded
document.addEventListener('DOMContentLoaded', function(){

    function getNumberForChar(char){
        char=char.toUpperCase();
        for(let num in pythagorasTable) if(pythagorasTable[num].includes(char)) return parseInt(num);
        return 0;
    }

    function reduceToSingleDigit(num){
        if([11,22,33].includes(num)) return num;
        while(num>9){
            num=(num%10)+Math.floor(num/10);
            if([11,22,33].includes(num)) break;
        }
        return num;
    }

    function calcNumber(name, filterFn = ()=>true){
        let sum=0;
        for(let char of name.replace(/\s+/g,'')){
            if(filterFn(char)) sum+=getNumberForChar(char);
        }
        return reduceToSingleDigit(sum);
    }

    function calculateLifePathNumber(dateOfBirth){
        const parts=dateOfBirth.split('.');
        if(parts.length!==3) return 0;
        let sum=0;
        for(let part of parts) for(let digit of part){
            const n=parseInt(digit);
            if(isNaN(n)) return 0;
            sum+=n;
        }
        return reduceToSingleDigit(sum);
    }

    function highlightMasterNumber(elementId, value){
        const el=document.getElementById(elementId);
        if(!el) return;
        el.textContent=value;
        el.classList.toggle('master',[11,22,33].includes(value));
    }

    function showExplanation(type,value,elementId){
        const el=document.getElementById(elementId);
        if(!el) return;
        const base=reduceToSingleDigit(value);
        el.textContent = `${base}${value!==base?'/'+value:''} — ${explanations[type][value]||''}`;
    }

    const form=document.getElementById('numerologyForm');
    if(!form){ console.error('Formular nicht gefunden'); return; }

    form.addEventListener('submit', function(event){
        event.preventDefault();
        const nameInput=document.getElementById('name');
        const dateInput=document.getElementById('birthdate');
        const name=nameInput.value.trim();
        const date=dateInput.value.trim();

        const nameErrEl=document.getElementById('nameError');
        const dateErrEl=document.getElementById('dateError');
        nameErrEl.textContent=''; dateErrEl.textContent='';

        let hasError=false;
        if(!name){ nameErrEl.textContent='Bitte Name eingeben.'; hasError=true; }
        if(!/^\d{2}\.\d{2}\.\d{4}$/.test(date)){ dateErrEl.textContent='TT.MM.JJJJ Format erforderlich.'; hasError=true; }
        if(hasError) return;

        const personality=calcNumber(name, c=>!['AEIOU'].includes(c.toUpperCase()));
        const soul=calcNumber(name, c=>['AEIOU'].includes(c.toUpperCase()));
        const expression=calcNumber(name);
        const life=calculateLifePathNumber(date);

        highlightMasterNumber('personalityNumber',personality);
        highlightMasterNumber('soulNumber',soul);
        highlightMasterNumber('expressionNumber',expression);
        highlightMasterNumber('lifePathNumber',life);

        showExplanation('life',life,'lifeExplanation');
        showExplanation('soul',soul,'soulExplanation');
        showExplanation('expression',expression,'expressionExplanation');
        showExplanation('personality',personality,'personalityExplanation');

        const extraGrid=document.getElementById('extraNumbersGrid');
        if(extraGrid) extraGrid.innerHTML='';
    });

});