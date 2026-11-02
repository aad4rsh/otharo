/* ==========================================================
   OTHARO — Application Script
   King's College Incubation Center
   Handles: mobile nav, sticky nav, FAQ accordion,
            animated counters, and the apply modal.
   ========================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       Initialization
       ------------------------------------------------------------------ */
    document.addEventListener('DOMContentLoaded', function () {
        initSmoothScroll();
        initLucide();
        initMobileMenu();
        initStickyNav();
        initFaqAccordion();
        initCounters();
        initStatsDeal();
        initPowerUpAnimation();
        initApplyModal();
    });

    /* ------------------------------------------------------------------
       Locomotive Scroll — smooth scrolling for the whole page.
       v5 runs on Lenis and drives the NATIVE window scroll, so the
       existing scroll listeners (sticky nav, card deck, counters via
       IntersectionObserver) keep working unchanged.
       ------------------------------------------------------------------ */
    function initSmoothScroll() {
        if (!window.LocomotiveScroll) return;

        new window.LocomotiveScroll({
            lenisOptions: {
                smoothWheel: true,
                smoothTouch: false,
                lerp: 0.1
            }
        });
    }

    /* ------------------------------------------------------------------
       Lucide icons
       ------------------------------------------------------------------ */
    function initLucide() {
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    /* ------------------------------------------------------------------
       Mobile menu toggle
       ------------------------------------------------------------------ */
    function initMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const nav = document.getElementById('main-nav');

        if (!btn || !menu) return;

        function setMenuOpen(open) {
            menu.classList.toggle('hidden', !open);
            if (nav) nav.classList.toggle('menu-open', open);
            btn.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        }

        btn.addEventListener('click', function () {
            setMenuOpen(menu.classList.contains('hidden'));
        });

        // Close the menu when a link inside it is clicked
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuOpen(false);
            });
        });

        // Close the menu when clicking anywhere outside of it
        document.addEventListener('click', function (e) {
            if (menu.classList.contains('hidden')) return;
            if (menu.contains(e.target) || btn.contains(e.target)) return;
            setMenuOpen(false);
        });
    }

    /* ------------------------------------------------------------------
       Navbar background change on scroll
       ------------------------------------------------------------------ */
    function initStickyNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        const hero = document.getElementById('hero');
        const heroHeight = hero ? hero.offsetHeight : window.innerHeight;

        const onScroll = function () {
            const solid = window.scrollY > heroHeight - 40;
            nav.classList.toggle('nav-solid', solid);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ------------------------------------------------------------------
       FAQ accordion (single-open behaviour)
       ------------------------------------------------------------------ */
    function initFaqAccordion() {
        const buttons = document.querySelectorAll('.faq-btn');
        if (!buttons.length) return;

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const content = btn.nextElementSibling;
                const icon = btn.querySelector('svg');
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';

                // Close every other FAQ
                buttons.forEach(function (other) {
                    if (other !== btn) {
                        other.setAttribute('aria-expanded', 'false');
                        other.nextElementSibling.classList.add('hidden');
                        const otherIcon = other.querySelector('svg');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                // Toggle the clicked FAQ
                if (isExpanded) {
                    btn.setAttribute('aria-expanded', 'false');
                    content.classList.add('hidden');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                } else {
                    btn.setAttribute('aria-expanded', 'true');
                    content.classList.remove('hidden');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    /* ------------------------------------------------------------------
       Animated counters in the "Impact" section
       ------------------------------------------------------------------ */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        const impact = document.getElementById('impact');
        if (!counters.length || !impact || !('IntersectionObserver' in window)) return;

        let animated = false;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    counters.forEach(animateCounter);
                    observer.unobserve(impact);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -25% 0px' });

        observer.observe(impact);
    }

    /* ------------------------------------------------------------------
       Card stacking scroll effect
       As each new card slides in and stacks on top, the buried cards
       smoothly scale down and dim — giving a physical depth illusion.
       ------------------------------------------------------------------ */
    function initStatsDeal() {
        const cards = document.querySelectorAll('.numbers-card');
        const right = document.querySelector('.numbers-right');
        if (!cards.length || !right) return;

        // Only run on desktop where sticky is active
        function isDesktop() { return window.innerWidth > 768; }

        // Matches CSS: cards pin at 30vh - (3 - index) * 22px
        function pinTopFor(index) {
            return window.innerHeight * 0.30 - (3 - index) * 22;
        }

        let ticking = false;

        function updateStack() {
            if (!isDesktop()) {
                // Reset all transforms on mobile
                cards.forEach(function (card) {
                    card.style.transform = '';
                    card.style.filter = '';
                });
                return;
            }

            // Natural document position of the right column (stable while scrolling)
            const rightDocTop = right.getBoundingClientRect().top + window.scrollY;

            cards.forEach(function (card, index) {
                // The scroll position at which this card's natural top would pin
                const arrival = (rightDocTop + card.offsetTop) - pinTopFor(index);

                // A card starts getting buried once the NEXT card pins over it
                const nextArrival = index < cards.length - 1
                    ? (rightDocTop + cards[index + 1].offsetTop) - pinTopFor(index + 1)
                    : Infinity;

                const scrolledPast = Math.max(0, window.scrollY - nextArrival);
                const progress = Math.min(1, scrolledPast / Math.max(1, card.offsetHeight));

                if (progress > 0) {
                    // Subtle scale from 1 -> 0.94 and brightness from 1 -> 0.85 for physical card depth
                    const scale = 1 - progress * 0.06;
                    const brightness = 1 - progress * 0.15;
                    card.style.transform = 'scale(' + scale.toFixed(4) + ')';
                    card.style.filter = 'brightness(' + brightness.toFixed(4) + ')';
                } else {
                    card.style.transform = '';
                    card.style.filter = '';
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateStack);
                ticking = true;
            }
        }, { passive: true });

        // Also run on resize in case columns switch
        window.addEventListener('resize', updateStack, { passive: true });

        // Initial run
        updateStack();
    }

    function animateCounter(counterEl) {
        const target = +counterEl.getAttribute('data-target');
        const speed = 200;
        const increment = target / speed;
        let count = 0;

        (function update() {
            count += increment;
            if (count < target) {
                counterEl.innerText = Math.ceil(count);
                setTimeout(update, 10);
            } else {
                counterEl.innerText = target;
            }
        })();
    }

    /* ------------------------------------------------------------------
       Apply modal
       ------------------------------------------------------------------ */
    function initApplyModal() {
        const modal = document.getElementById('apply-modal');
        if (!modal) return;

        window.openApplyModal = function (e) {
            if (e) e.preventDefault();
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        window.closeApplyModal = function () {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';

            // Reset form state
            const form = document.getElementById('incubator-form');
            const success = document.getElementById('form-success');
            if (form) {
                form.classList.remove('hidden');
                form.reset();
            }
            if (success) success.classList.add('hidden');
        };

        window.handleFormSubmit = function (e) {
            e.preventDefault();
            const form = document.getElementById('incubator-form');
            const success = document.getElementById('form-success');
            if (form) form.classList.add('hidden');
            if (success) success.classList.remove('hidden');
            initLucide();
        };

        // Close when clicking the backdrop
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                window.closeApplyModal();
            }
        });
    }

    /* ------------------------------------------------------------------
       Power Up Your Potential — Scroll-triggered 3-Card Stagger & Pin
       Choreography:
       - Phase 1 (0 -> 28%): Card 1 (Innovation Kitchen) glides up,
         tilts -7.5deg, and locks into the LEFT position.
       - Phase 2 (28% -> 60%): Card 2 (Startup Garage) glides up,
         settles upright (0deg), and locks into the CENTER position.
       - Phase 3 (60% -> 92%): Card 3 (Othāro Incubation) glides up,
         tilts +7.5deg, and locks into the RIGHT position.
       - The full 3-card trio sits locked until scrolling past the section.
       ------------------------------------------------------------------ */
    function initPowerUpAnimation() {
        const section = document.getElementById('offerings');
        if (!section) return;

        const card1 = document.getElementById('card-innovation');
        const card2 = document.getElementById('card-garage');
        const card3 = document.getElementById('card-incubation');
        if (!card1 || !card2 || !card3) return;

        function isDesktop() { return window.innerWidth > 768; }

        let ticking = false;

        function updatePowerCards() {
            if (!isDesktop()) {
                [card1, card2, card3].forEach(function (c) {
                    c.style.transform = '';
                    c.style.opacity = '';
                });
                return;
            }

            const rect = section.getBoundingClientRect();
            const sectionH = section.offsetHeight;
            const windowH = window.innerHeight;
            const maxScroll = sectionH - windowH;

            if (maxScroll <= 0) return;

            // Normalized progress from 0 (section top hits viewport top) to 1 (section end)
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / maxScroll));

            function easeOutCubic(t) {
                const clamped = Math.max(0, Math.min(1, t));
                return 1 - Math.pow(1 - clamped, 3);
            }

            // --- Card 1: Innovation Kitchen (Left) ---
            // Animates in from p: 0.00 to 0.28, then stays stuck tilted left at -7.5deg
            const t1 = Math.max(0, Math.min(1, p / 0.28));
            const e1 = easeOutCubic(t1);
            const y1 = (1 - e1) * 160;
            const rot1 = -7.5 * e1;
            const op1 = Math.min(1, t1 * 2);
            const scale1 = 0.88 + 0.12 * e1;
            card1.style.transform = 'translate3d(0, ' + y1.toFixed(2) + 'px, 0) rotate(' + rot1.toFixed(2) + 'deg) scale(' + scale1.toFixed(3) + ')';
            card1.style.opacity = op1.toFixed(3);

            // --- Card 2: Startup Garage (Middle) ---
            // Animates in from p: 0.28 to 0.60, then stays stuck upright at 0deg
            const t2 = Math.max(0, Math.min(1, (p - 0.28) / 0.32));
            const e2 = easeOutCubic(t2);
            const y2 = (1 - e2) * 160;
            const rot2 = 0;
            const op2 = Math.min(1, t2 * 2);
            const scale2 = 0.88 + 0.12 * e2;
            card2.style.transform = 'translate3d(0, ' + y2.toFixed(2) + 'px, 0) rotate(' + rot2 + 'deg) scale(' + scale2.toFixed(3) + ')';
            card2.style.opacity = op2.toFixed(3);

            // --- Card 3: Othāro Incubation (Right) ---
            // Animates in from p: 0.60 to 0.92, then stays stuck tilted right at +7.5deg
            const t3 = Math.max(0, Math.min(1, (p - 0.60) / 0.32));
            const e3 = easeOutCubic(t3);
            const y3 = (1 - e3) * 160;
            const rot3 = 7.5 * e3;
            const op3 = Math.min(1, t3 * 2);
            const scale3 = 0.88 + 0.12 * e3;
            card3.style.transform = 'translate3d(0, ' + y3.toFixed(2) + 'px, 0) rotate(' + rot3.toFixed(2) + 'deg) scale(' + scale3.toFixed(3) + ')';
            card3.style.opacity = op3.toFixed(3);

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updatePowerCards);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', function () {
            updatePowerCards();
        }, { passive: true });

        // Initial setup
        updatePowerCards();
    }
})();
