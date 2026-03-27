/**
 * recette.js — Le Coin Gourmand
 * Moteur partagé pour toutes les pages recette.
 * Nouveautés : QR code, partage, commentaires, impression, stats vues, historique.
 *
 * Chaque page déclare window.RECIPE_DATA avant ce script :
 *   window.RECIPE_DATA = {
 *     id: 1,
 *     basePortions: 4, portionLabel: "personnes", portionMin: 1, portionMax: 24, portionStep: 1,
 *     ingredients: [ ... ],
 *     steps: [ { text: "...", timer: null } ]
 *   };
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Dark mode ────────────────────────────────────────────────────────
    const toggle   = document.getElementById('dark-mode-toggle');
    const iconSun  = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');

    function applyDark(on) {
        document.documentElement.classList.toggle('dark', on);
        iconSun.style.display  = on ? 'none' : '';
        iconMoon.style.display = on ? '' : 'none';
    }

    toggle.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', on); applyDark(on);
    });
    applyDark(localStorage.getItem('darkMode') === 'true');

    // ── Données recette ──────────────────────────────────────────────────
    const DATA = window.RECIPE_DATA;
    if (!DATA) return;

    // ── Stats de vues ────────────────────────────────────────────────────
    if (DATA.id) {
        const views = JSON.parse(localStorage.getItem('lcg_views') || '{}');
        views[DATA.id] = (views[DATA.id] || 0) + 1;
        localStorage.setItem('lcg_views', JSON.stringify(views));
    }

    // ── Historique ───────────────────────────────────────────────────────
    if (DATA.id) {
        const history = JSON.parse(localStorage.getItem('lcg_history') || '[]')
            .filter(h => h.id !== DATA.id)
            .slice(0, 19);
        history.unshift({ id: DATA.id, href: window.location.pathname, ts: Date.now() });
        localStorage.setItem('lcg_history', JSON.stringify(history));
    }

    // ── Rendu ingrédients ────────────────────────────────────────────────
    const ingList = document.getElementById('ingredients-list');

    function renderIngredients(portions) {
        ingList.innerHTML = '';
        const ratio = portions / DATA.basePortions;
        DATA.ingredients.forEach(ing => {
            if (ing.group) {
                const li = document.createElement('li');
                li.className = 'ingredient-group-title';
                li.textContent = ing.group;
                ingList.appendChild(li);
                return;
            }
            const li = document.createElement('li');
            li.className = 'ingredient-item';
            li.title = 'Cliquer pour cocher';
            let qtyText = '';
            if (ing.qty !== null && ing.qty !== undefined) {
                const raw = ing.qty * ratio;
                const val = raw >= 10 ? Math.round(raw) : Math.round(raw * 10) / 10;
                qtyText   = `${val}${ing.unit ? '\u00a0' + ing.unit : ''}`;
            }
            const labelVal = (ing.qty !== null && ing.plural && (ing.qty * ratio) > 1) ? ing.plural : ing.label;
            li.innerHTML = qtyText
                ? `<span class="qty">${qtyText}</span><span>${labelVal}</span>`
                : `<span>${ing.label}</span>`;
            li.addEventListener('click', () => li.classList.toggle('checked'));
            ingList.appendChild(li);
        });
    }

    // ── Portions ─────────────────────────────────────────────────────────
    const portInput = document.getElementById('portions-input');
    const btnMinus  = document.getElementById('btn-minus');
    const btnPlus   = document.getElementById('btn-plus');
    const portLabel = document.getElementById('portion-label');

    if (portInput) {
        portInput.value = DATA.basePortions;
        portInput.min   = DATA.portionMin || 1;
        portInput.max   = DATA.portionMax || 48;
        if (portLabel) portLabel.textContent = DATA.portionLabel || 'personnes';
        const step = DATA.portionStep || 1;
        btnMinus.addEventListener('click', () => {
            const cur = parseInt(portInput.value);
            if (cur - step >= (DATA.portionMin || 1)) { portInput.value = cur - step; renderIngredients(parseInt(portInput.value)); }
        });
        btnPlus.addEventListener('click', () => {
            const cur = parseInt(portInput.value);
            if (cur + step <= (DATA.portionMax || 48)) { portInput.value = cur + step; renderIngredients(parseInt(portInput.value)); }
        });
        portInput.addEventListener('input', () => { const v = parseInt(portInput.value); if (!isNaN(v) && v >= 1) renderIngredients(v); });
    }

    renderIngredients(DATA.basePortions);

    // ── Étapes ───────────────────────────────────────────────────────────
    const stepsList = document.getElementById('steps-list');
    const timers    = {};

    function formatTime(sec) {
        const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
        if (h > 0) return `${h}h${String(m).padStart(2,'0')}`;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    function buildTimerEl(idx, seconds) {
        const btn = document.createElement('button');
        btn.className = 'step-timer';
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="timer-display">${formatTime(seconds)}</span><span class="timer-label">Lancer</span>`;
        btn.addEventListener('click', () => {
            if (!timers[idx]) {
                timers[idx] = { remaining: seconds };
                btn.classList.add('running');
                btn.querySelector('.timer-label').textContent = 'En cours…';
                const disp = btn.querySelector('.timer-display');
                timers[idx].interval = setInterval(() => {
                    timers[idx].remaining--;
                    disp.textContent = formatTime(timers[idx].remaining);
                    if (timers[idx].remaining <= 0) {
                        clearInterval(timers[idx].interval); delete timers[idx];
                        btn.classList.remove('running'); btn.classList.add('done-timer');
                        disp.textContent = '✓ Terminé !'; btn.querySelector('.timer-label').textContent = '';
                        try {
                            const ctx = new (window.AudioContext||window.webkitAudioContext)();
                            [0,0.15,0.3].forEach(o => { const osc=ctx.createOscillator(),g=ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.frequency.value=880; g.gain.setValueAtTime(0.3,ctx.currentTime+o); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+o+0.4); osc.start(ctx.currentTime+o); osc.stop(ctx.currentTime+o+0.4); });
                        } catch(e) {}
                    }
                }, 1000);
            } else {
                clearInterval(timers[idx].interval); delete timers[idx];
                btn.classList.remove('running');
                btn.querySelector('.timer-display').textContent = formatTime(seconds);
                btn.querySelector('.timer-label').textContent = 'Lancer';
            }
        });
        return btn;
    }

    DATA.steps.forEach((step, i) => {
        const li = document.createElement('li');
        li.className = 'step-item'; li.dataset.idx = i;
        const num = document.createElement('div'); num.className = 'step-num'; num.textContent = i+1;
        const content = document.createElement('div'); content.className = 'step-content';
        const text = document.createElement('p'); text.className = 'step-text'; text.innerHTML = step.text;
        content.appendChild(text);
        if (step.timer && step.timer > 0) content.appendChild(buildTimerEl(i, step.timer));
        const check = document.createElement('button'); check.className = 'step-check'; check.setAttribute('aria-label','Marquer comme fait');
        check.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
        check.addEventListener('click', () => {
            li.classList.toggle('done');
            if (li.classList.contains('done')) {
                document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
                li.nextElementSibling?.classList.add('active');
            }
        });
        li.appendChild(num); li.appendChild(content); li.appendChild(check);
        stepsList.appendChild(li);
    });

    stepsList.querySelector('.step-item')?.classList.add('active');

    // ── BOUTON IMPRESSION ────────────────────────────────────────────────
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    // ── PARTAGE + QR CODE ────────────────────────────────────────────────
    const sharePanel = document.getElementById('share-panel');
    const btnShare   = document.getElementById('btn-share');

    if (btnShare && sharePanel) {
        btnShare.addEventListener('click', e => {
            e.stopPropagation();
            sharePanel.classList.toggle('open');
            if (sharePanel.classList.contains('open')) generateQR();
        });

        document.addEventListener('click', e => {
            if (!sharePanel.contains(e.target) && !btnShare.contains(e.target)) sharePanel.classList.remove('open');
        });
    }

    document.getElementById('btn-copy-link')?.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById('btn-copy-link');
            const orig = btn.textContent;
            btn.textContent = '✓ Copié !';
            btn.style.background = 'var(--green)'; btn.style.color = 'white';
            setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
        });
    });

    function generateQR() {
        const container = document.getElementById('qr-container');
        if (!container || container.querySelector('canvas')) return;

        const url  = window.location.href;
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        container.appendChild(canvas);

        // QR code minimaliste sans librairie externe (version simplifiée)
        // On utilise l'API de qr-server comme fallback image
        const img = document.createElement('img');
        img.src   = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
        img.alt   = 'QR Code';
        img.width = size; img.height = size;
        img.style.borderRadius = '8px';
        container.innerHTML = '';
        container.appendChild(img);
    }

    // ── COMMENTAIRES ─────────────────────────────────────────────────────
    const commentsKey = `lcg_comments_${DATA.id}`;

    function loadComments() {
        try { return JSON.parse(localStorage.getItem(commentsKey)) || []; }
        catch { return []; }
    }

    function saveComments(c) { localStorage.setItem(commentsKey, JSON.stringify(c)); }

    function renderComments() {
        const list = document.getElementById('comments-list');
        const count = document.getElementById('comments-count');
        if (!list) return;
        const comments = loadComments();
        if (count) count.textContent = `(${comments.length})`;
        list.innerHTML = '';
        if (!comments.length) {
            list.innerHTML = '<p class="comment-empty">Soyez le premier à commenter cette recette !</p>';
            return;
        }
        comments.slice().reverse().forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);
            const date  = new Date(c.ts).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
            div.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${c.author}</span>
                    <span class="comment-stars">${stars}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <p class="comment-text">${c.text}</p>
            `;
            list.appendChild(div);
        });
    }

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        // Stars interactives dans le formulaire
        const formStars = commentForm.querySelectorAll('.form-star');
        let selectedRating = 0;

        formStars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const v = parseInt(star.dataset.value);
                formStars.forEach(s => s.classList.toggle('hover', parseInt(s.dataset.value) <= v));
            });
            star.addEventListener('mouseout', () => formStars.forEach(s => s.classList.remove('hover')));
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.value);
                formStars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.value) <= selectedRating));
            });
        });

        commentForm.addEventListener('submit', e => {
            e.preventDefault();
            const author = document.getElementById('comment-author')?.value.trim();
            const text   = document.getElementById('comment-text')?.value.trim();
            if (!author || !text || selectedRating === 0) {
                alert('Veuillez remplir tous les champs et donner une note.'); return;
            }
            const comments = loadComments();
            comments.push({ author, text, rating: selectedRating, ts: Date.now() });
            saveComments(comments);
            commentForm.reset();
            selectedRating = 0;
            formStars.forEach(s => s.classList.remove('selected', 'hover'));
            renderComments();
        });
    }

    renderComments();
});