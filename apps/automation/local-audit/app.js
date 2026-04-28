/**
 * Local Business Audit Assistant - MBRN MVP
 * Vanilla JS logic for discovery, scoring, and pitch generation.
 */

const CHECKLIST_ITEMS = [
    { id: 'mobile', label: 'Mobile Optimierung', weight: 25, impact: 'Eingeschränkte Nutzbarkeit auf Smartphones' },
    { id: 'https', label: 'Sicherheit (SSL/HTTPS)', weight: 15, impact: 'Mögliche Warnungen im Browser und Vertrauensverlust' },
    { id: 'meta', label: 'Google-Sichtbarkeit (Meta-Tags)', weight: 15, impact: 'Potenzielle Kunden finden die Seite schwerer' },
    { id: 'cta', label: 'Klare Kontaktmöglichkeiten', weight: 20, impact: 'Interessenten wissen nicht, wie sie Sie erreichen' },
    { id: 'speed', label: 'Ladezeit (< 3 Sek.)', weight: 15, impact: 'Besucher springen bei langsamen Seiten ab' },
    { id: 'reviews', label: 'Kundenstimmen / Vertrauen', weight: 10, impact: 'Fehlende soziale Beweise für Qualität' }
];

const STORAGE_KEY = 'mbrn_local_audits';

let currentAudit = {
    name: '',
    url: '',
    checks: {},
    score: 0,
    notes: ''
};

// --- DOM Elements ---
const sections = {
    input: document.getElementById('input-section'),
    audit: document.getElementById('audit-section'),
    result: document.getElementById('result-section')
};

const historyList = document.getElementById('audit-history-list');
const checklistContainer = document.getElementById('checklist-container');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    loadHistory();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('start-audit-btn').addEventListener('click', startAudit);
    document.getElementById('generate-pitch-btn').addEventListener('click', generatePitch);
    document.getElementById('save-audit-btn').addEventListener('click', saveAndReset);
    document.getElementById('cancel-audit-btn').addEventListener('click', () => showSection('input'));
    document.getElementById('copy-pitch-btn').addEventListener('click', copyPitchToClipboard);
}

function initChecklist() {
    checklistContainer.innerHTML = '';
    CHECKLIST_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <span class="checklist-label">${item.label}</span>
            <label class="switch">
                <input type="checkbox" data-id="${item.id}" onchange="updateScore()">
                <span class="slider"></span>
            </label>
        `;
        checklistContainer.appendChild(div);
    });
}

// --- Logic ---

function startAudit() {
    const name = document.getElementById('business-name').value.trim();
    const url = document.getElementById('business-url').value.trim();

    if (!name || !url) {
        alert('Bitte geben Sie einen Namen und eine URL ein.');
        return;
    }

    currentAudit = {
        name,
        url,
        checks: {},
        score: 0,
        notes: '',
        timestamp: new Date().toISOString()
    };

    document.getElementById('active-business-name').textContent = `${name}`;
    resetChecklist();
    showSection('audit');
}

function updateScore() {
    let totalScore = 0;
    const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(cb => {
        const itemId = cb.dataset.id;
        const item = CHECKLIST_ITEMS.find(i => i.id === itemId);
        if (cb.checked) {
            totalScore += item.weight;
            cb.closest('.checklist-item').classList.add('checked');
        } else {
            cb.closest('.checklist-item').classList.remove('checked');
        }
        currentAudit.checks[itemId] = cb.checked;
    });

    currentAudit.score = totalScore;
    document.getElementById('current-score').textContent = totalScore;
    
    const scoreEl = document.getElementById('current-score');
    if (totalScore < 50) scoreEl.style.color = 'var(--error)';
    else if (totalScore < 80) scoreEl.style.color = 'var(--warning)';
    else scoreEl.style.color = 'var(--success)';
}

function generatePitch() {
    const notes = document.getElementById('audit-notes').value.trim();
    currentAudit.notes = notes;

    const failedItems = CHECKLIST_ITEMS.filter(item => !currentAudit.checks[item.id]);
    
    let pitch = `Betreff: Optimierungs-Potenzial für die Webseite von ${currentAudit.name}\n\n`;
    pitch += `Sehr geehrtes Team von ${currentAudit.name},\n\n`;
    pitch += `ich bin gerade auf Ihre Webseite (${currentAudit.url}) aufmerksam geworden. Da ich mich auf die digitale Sichtbarkeit von Unternehmen in unserer Region spezialisiert habe, habe ich mir erlaubt, einen kurzen, unverbindlichen Check Ihrer Seite durchzuführen.\n\n`;
    
    if (failedItems.length > 0) {
        pitch += `Dabei sind mir ${failedItems.length} Punkte aufgefallen, die aktuell potenzielle Kunden davon abhalten könnten, Sie zu kontaktieren:\n\n`;
        failedItems.forEach(item => {
            pitch += `• ${item.label}: ${item.impact}.\n`;
        });
        pitch += `\n`;
    } else {
        pitch += `Ihre Webseite ist bereits sehr gut aufgestellt! Ich habe jedoch eine zusätzliche Idee gefunden, wie Sie Ihre Prozesse noch weiter automatisieren könnten.\n\n`;
    }

    if (notes) {
        pitch += `Mein persönlicher Eindruck: ${notes}\n\n`;
    }

    pitch += `Ich helfe lokalen Unternehmen dabei, diese technischen Hürden mit modernen Automatisierungslösungen (MBRN) zu lösen, damit Sie sich wieder voll auf Ihr Kerngeschäft konzentrieren können.\n\n`;
    pitch += `Hätten Sie Interesse an einem kurzen, 5-minütigen Austausch dazu? Ich würde Ihnen gerne zeigen, was hier mit wenig Aufwand möglich ist.\n\n`;
    pitch += `Beste Grüße,\nIhr Team vom MBRN Automation Hub`;

    document.getElementById('pitch-text').textContent = pitch;
    showSection('result');
}

function saveAndReset() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.unshift(currentAudit);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    
    loadHistory();
    showSection('input');
    
    document.getElementById('business-name').value = '';
    document.getElementById('business-url').value = '';
    document.getElementById('audit-notes').value = '';
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-muted text-center p-24">Noch keine Analysen gespeichert.</p>';
        return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>
                <div class="bold">${item.name}</div>
                <div class="history-meta">${item.url} • ${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
            <div class="text-accent bold">${item.score}/100</div>
        `;
        historyList.appendChild(div);
    });
}

function showSection(sectionId) {
    Object.keys(sections).forEach(key => {
        if (key === sectionId) {
            sections[key].style.display = 'block';
            setTimeout(() => sections[key].classList.add('visible'), 10);
        } else {
            sections[key].style.display = 'none';
            sections[key].classList.remove('visible');
        }
    });
}

function resetChecklist() {
    const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        cb.closest('.checklist-item').classList.remove('checked');
    });
    document.getElementById('current-score').textContent = '0';
    document.getElementById('current-score').style.color = 'var(--text-primary)';
}

async function copyPitchToClipboard() {
    const text = document.getElementById('pitch-text').textContent;
    try {
        await navigator.clipboard.writeText(text);
        const btn = document.getElementById('copy-pitch-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('btn-success');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-success');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy!', err);
    }
}
