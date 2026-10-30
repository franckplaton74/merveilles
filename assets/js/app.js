/* CREATIO — socle d'interaction (aucune dépendance, aucune requête réseau hors site) */
const racine = document.documentElement;
const reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Stockage défensif : en navigation privée (ou si les cookies de site sont bloqués),
   l'accès à localStorage lève une exception — sans ce garde-fou, tout le script
   s'arrêtait et le menu comme les préférences cessaient de répondre. */
const stockage = (function () {
  try {
    const essai = 'creatio:essai';
    window.stockage.setItem(essai, '1');
    window.localStorage.removeItem(essai);
    return window.localStorage;
  } catch (e) {
    return { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
  }
}());

/* ── tiroir de navigation ─────────────────────────────────────────────── */
const bouton = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

function fermerNav() {
  if (!nav || !bouton) return;
  nav.dataset.ouvert = 'false';
  bouton.setAttribute('aria-expanded', 'false');
  bouton.querySelector('.nav-toggle__label').textContent = 'Menu';
}

if (bouton && nav) {
  bouton.addEventListener('click', () => {
    const ouvert = nav.dataset.ouvert === 'true';
    nav.dataset.ouvert = ouvert ? 'false' : 'true';
    bouton.setAttribute('aria-expanded', String(!ouvert));
    bouton.querySelector('.nav-toggle__label').textContent = ouvert ? 'Menu' : 'Fermer';
    if (!ouvert) nav.querySelector('a')?.focus();
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) fermerNav(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerNav(); });
}

/* ── barre de progression de lecture ──────────────────────────────────── */
const barre = document.querySelector('[data-progress-bar]');
if (barre) {
  let planifie = false;
  const maj = () => {
    planifie = false;
    const h = document.documentElement;
    const course = h.scrollHeight - h.clientHeight;
    barre.style.width = (course > 0 ? Math.min(1, h.scrollTop / course) * 100 : 0) + '%';
  };
  addEventListener('scroll', () => { if (!planifie) { planifie = true; requestAnimationFrame(maj); } }, { passive: true });
  maj();
}

/* ── préférences : mouvement réduit, mémorisé ─────────────────────────── */
const cle = 'creatio:mouvement-reduit';
const choix = stockage.getItem(cle);
if (choix === 'oui') racine.dataset.mouvementReduit = 'oui';
if (reduit.matches) racine.dataset.mouvementReduit = 'oui';

window.creatio = {
  mouvementReduit: () => racine.dataset.mouvementReduit === 'oui' || reduit.matches,
  definirMouvementReduit(valeur) {
    if (valeur) { racine.dataset.mouvementReduit = 'oui'; stockage.setItem(cle, 'oui'); }
    else { delete racine.dataset.mouvementReduit; stockage.setItem(cle, 'non'); }
  },
};

/* ── confort de lecture : taille du texte, mémorisée ──────────────────── */
const cleConfort = 'creatio:confort';
const boutonConfort = document.querySelector('[data-confort-toggle]');
const confort = stockage.getItem(cleConfort);

function appliquerConfort(valeur) {
  if (valeur === 'grand') racine.dataset.confort = 'grand';
  else delete racine.dataset.confort;
  if (boutonConfort) {
    boutonConfort.setAttribute('aria-pressed', String(valeur === 'grand'));
    boutonConfort.querySelector('[data-confort-label]').textContent =
      valeur === 'grand' ? 'Texte normal' : 'Texte plus grand';
  }
}

if (confort === 'grand') appliquerConfort('grand');
if (boutonConfort) {
  boutonConfort.hidden = false;               /* sans JS, le bouton reste caché */
  boutonConfort.addEventListener('click', () => {
    const suivant = racine.dataset.confort === 'grand' ? 'normal' : 'grand';
    appliquerConfort(suivant);
    stockage.setItem(cleConfort, suivant);
  });
}
