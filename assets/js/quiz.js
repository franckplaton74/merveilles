/* CREATIO — interaction de galerie (aile VIII) : contrôle des réponses, sans dépendance. */
(function () {
  var forms = document.querySelectorAll('[data-quiz]');
  if (!forms.length) { return; }

  Array.prototype.forEach.call(forms, function (form) {
    var score = form.querySelector('[data-score]');

    function corriger(champ) {
      var bloc = champ.closest('.quiz__q');
      if (!bloc) { return; }
      var retour = bloc.querySelector('[data-retour]');
      var bonne = parseInt(retour.dataset.bonne, 10);
      var juste = parseInt(champ.value, 10) === bonne;
      Array.prototype.forEach.call(bloc.querySelectorAll('.quiz__opt'), function (opt) {
        opt.classList.remove('est-juste', 'est-faux');
        var input = opt.querySelector('input');
        if (parseInt(input.value, 10) === bonne) { opt.classList.add('est-juste'); }
      });
      if (!juste) { champ.closest('.quiz__opt').classList.add('est-faux'); }
      retour.hidden = false;
      retour.innerHTML = (juste ? '<strong>Exact.</strong> ' : '<strong>Pas tout à fait.</strong> ')
        + retour.dataset.explication
        + ' <span class="quiz__src">(fiche ' + retour.dataset.fiche + ' · ' + retour.dataset.source + ')</span>';
    }

    form.addEventListener('change', function (e) {
      if (e.target.type === 'radio') { corriger(e.target); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bons = 0, total = 0;
      Array.prototype.forEach.call(form.querySelectorAll('.quiz__q'), function (bloc) {
        total += 1;
        var choisi = bloc.querySelector('input:checked');
        var retour = bloc.querySelector('[data-retour]');
        if (choisi) { corriger(choisi); }
        if (choisi && parseInt(choisi.value, 10) === parseInt(retour.dataset.bonne, 10)) { bons += 1; }
      });
      if (score) {
        score.textContent = bons + ' / ' + total
          + (bons === total ? ' — tout est juste : les légendes n\'ont pas résisté.' : ' — relisez les corrections.');
      }
    });

    form.addEventListener('reset', function () {
      window.setTimeout(function () {
        Array.prototype.forEach.call(form.querySelectorAll('.quiz__retour'), function (r) {
          r.hidden = true; r.innerHTML = '';
        });
        Array.prototype.forEach.call(form.querySelectorAll('.quiz__opt'), function (o) {
          o.classList.remove('est-juste', 'est-faux');
        });
        if (score) { score.textContent = ''; }
      }, 0);
    });
  });
}());
