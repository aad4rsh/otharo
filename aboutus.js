/* =========================================================
   Otharo — About Us Page Scripts
   Polaroid cluster: hovering a card straightens it and shows
   its caption while siblings dim. Each card is a link to the
   member's profile page, so tap / click / Enter navigates.
   ========================================================= */

(function () {
    'use strict';

    var cluster = document.getElementById('team-cluster');
    if (!cluster) return;

    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var cards = Array.prototype.slice.call(cluster.querySelectorAll('.team-card'));

    function setActive(card, active) {
        cards.forEach(function (c) {
            c.classList.toggle('is-active', active && c === card);
        });
        cluster.classList.toggle('js-focus', !!(active && card));
    }

    /* Desktop hover: follow the pointer across cards, clear on leave */
    if (!coarse) {
        cluster.addEventListener('mouseover', function (e) {
            var card = e.target && e.target.closest ? e.target.closest('.team-card') : null;
            if (card && cluster.contains(card)) setActive(card, true);
        });
        cluster.addEventListener('mouseleave', function () {
            setActive(null, false);
        });
    }

    /* Keyboard: straighten the focused card, Escape clears it */
    cards.forEach(function (card) {
        card.addEventListener('focus', function () { setActive(card, true); });
        card.addEventListener('blur', function () {
            if (!cluster.contains(document.activeElement)) setActive(null, false);
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setActive(null, false);
        });
    });
})();
