/**
 * recette.js — Le Coin Gourmand
 * Moteur partagé pour toutes les pages recette.
 *
 * Chaque page recette déclare une variable globale RECIPE_DATA avant ce script :
 *
 *   window.RECIPE_DATA = {
 *     basePortions: 4,
 *     portionLabel: "personnes",   // ou "cookies", "pancakes"…
 *     portionMin: 1,
 *     portionMax: 24,
 *     portionStep: 1,
 *     ingredients: [
 *       // Ingrédient simple
 *       { id: "beurre", qty: 100, unit: "g", label: "beurre mou" },
 *       // Ingrédient avec pluriel
 *       { id: "oeuf", qty: 2, unit: "", label: "oeuf", plural: "oeufs" },
 *       // Ingrédient fixe (pas de calcul)
 *       { id: null, qty: null, label: "1 pincée de sel" },
 *       // Groupe titre
 *       { group: "Pour le biscuit :" },
 *     ],
 *     steps: [
 *       { text: "Préchauffez le four à 180°C.", timer: null },
 *       { text: "Enfournez pour 25 minutes.", timer: 25 * 60 },
 *     ]
 *   };
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Dark mode ────────────────────────────────────────────────────────────
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
    localStorage.setItem('darkMode', on);
    applyDark(on);
  });

  applyDark(localStorage.getItem('darkMode') === 'true');

  // ── Données recette ──────────────────────────────────────────────────────
  const DATA = window.RECIPE_DATA;
  if (!DATA) return;

  // ── Rendu ingrédients ────────────────────────────────────────────────────
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
        // Format propre : entier si possible, sinon 1 décimale
        const val = raw >= 10
          ? Math.round(raw)
          : Math.round(raw * 10) / 10;

        let unitLabel = ing.unit || '';

        // Pluriel
        if (ing.plural && val > 1) {
          // le label sera aussi au pluriel si défini
        }

        qtyText = `${val}${unitLabel ? '\u00a0' + unitLabel : ''}`;
      }

      const labelVal = (ing.qty !== null && ing.plural && (ing.qty * ratio) > 1)
        ? ing.plural
        : ing.label;

      li.innerHTML = qtyText
        ? `<span class="qty">${qtyText}</span><span>${labelVal}</span>`
        : `<span>${ing.label}</span>`;

      li.addEventListener('click', () => li.classList.toggle('checked'));
      ingList.appendChild(li);
    });
  }

  // ── Portions controller ──────────────────────────────────────────────────
  const portInput = document.getElementById('portions-input');
  const btnMinus  = document.getElementById('btn-minus');
  const btnPlus   = document.getElementById('btn-plus');
  const portLabel = document.getElementById('portion-label');

  if (portInput) {
    portInput.value = DATA.basePortions;
    portInput.min   = DATA.portionMin  || 1;
    portInput.max   = DATA.portionMax  || 24;
    if (portLabel) portLabel.textContent = DATA.portionLabel || 'personnes';

    const step = DATA.portionStep || 1;

    btnMinus.addEventListener('click', () => {
      const cur = parseInt(portInput.value);
      if (cur - step >= (DATA.portionMin || 1)) {
        portInput.value = cur - step;
        renderIngredients(parseInt(portInput.value));
      }
    });

    btnPlus.addEventListener('click', () => {
      const cur = parseInt(portInput.value);
      if (cur + step <= (DATA.portionMax || 48)) {
        portInput.value = cur + step;
        renderIngredients(parseInt(portInput.value));
      }
    });

    portInput.addEventListener('input', () => {
      const val = parseInt(portInput.value);
      if (!isNaN(val) && val >= 1) renderIngredients(val);
    });
  }

  renderIngredients(DATA.basePortions);

  // ── Rendu étapes ─────────────────────────────────────────────────────────
  const stepsList = document.getElementById('steps-list');
  const timers = {}; // { stepIndex: { interval, remaining, el } }

  function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h${String(m).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function buildTimerEl(stepIdx, seconds) {
    const btn = document.createElement('button');
    btn.className = 'step-timer';
    btn.dataset.idx = stepIdx;
    btn.dataset.total = seconds;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span class="timer-display">${formatTime(seconds)}</span>
      <span class="timer-label">Lancer le minuteur</span>
    `;

    btn.addEventListener('click', () => {
      const state = timers[stepIdx];

      if (!state) {
        // Démarrer
        timers[stepIdx] = { remaining: seconds };
        btn.classList.add('running');
        btn.querySelector('.timer-label').textContent = 'En cours…';

        const display = btn.querySelector('.timer-display');
        timers[stepIdx].interval = setInterval(() => {
          timers[stepIdx].remaining--;
          display.textContent = formatTime(timers[stepIdx].remaining);

          if (timers[stepIdx].remaining <= 0) {
            clearInterval(timers[stepIdx].interval);
            delete timers[stepIdx];
            btn.classList.remove('running');
            btn.classList.add('done-timer');
            display.textContent = '✓ Terminé !';
            btn.querySelector('.timer-label').textContent = '';
            // Notification sonore simple
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              [0, 0.15, 0.3].forEach(offset => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4);
                osc.start(ctx.currentTime + offset);
                osc.stop(ctx.currentTime + offset + 0.4);
              });
            } catch(e) {}
          }
        }, 1000);

      } else {
        // Annuler
        clearInterval(state.interval);
        delete timers[stepIdx];
        btn.classList.remove('running');
        btn.querySelector('.timer-display').textContent = formatTime(seconds);
        btn.querySelector('.timer-label').textContent = 'Lancer le minuteur';
      }
    });

    return btn;
  }

  DATA.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.className = 'step-item';
    li.dataset.idx = i;

    // Numéro
    const num = document.createElement('div');
    num.className = 'step-num';
    num.textContent = i + 1;

    // Contenu
    const content = document.createElement('div');
    content.className = 'step-content';

    const text = document.createElement('p');
    text.className = 'step-text';
    text.innerHTML = step.text;
    content.appendChild(text);

    if (step.timer && step.timer > 0) {
      content.appendChild(buildTimerEl(i, step.timer));
    }

    // Bouton cocher
    const check = document.createElement('button');
    check.className = 'step-check';
    check.setAttribute('aria-label', 'Marquer comme fait');
    check.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>`;

    check.addEventListener('click', () => {
      li.classList.toggle('done');
      // Marquer active la suivante
      if (li.classList.contains('done')) {
        const next = li.nextElementSibling;
        if (next) {
          document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
          next.classList.add('active');
        }
      }
    });

    li.appendChild(num);
    li.appendChild(content);
    li.appendChild(check);
    stepsList.appendChild(li);
  });

  // Première étape active par défaut
  const firstStep = stepsList.querySelector('.step-item');
  if (firstStep) firstStep.classList.add('active');
});
