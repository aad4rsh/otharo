/* =========================================================
   Otharo — Incubation Page Scripts
   ========================================================= */

(function () {
    'use strict';

    /* ---------- Smooth scrolling (Locomotive Scroll) ----------
       v5 runs on Lenis and drives the NATIVE scroll, so the
       parallax/nav/counter scroll listeners keep working. */
    if (window.LocomotiveScroll) {
        new window.LocomotiveScroll({
            lenisOptions: {
                smoothWheel: true,
                smoothTouch: false,
                lerp: 0.1
            }
        });
    }

    /* ---------- Hero sticky parallax ---------- */
    var heroCopy = document.querySelector('.hero-copy');
    var heroSub = document.querySelector('.hero-sub');
    var heroCue = document.querySelector('.hero-cue');
    var heroSvgLeft = document.querySelector('.hero-svg-left');
    var heroSvgRight = document.querySelector('.hero-svg-right');

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function onParallax() {
        var vh = window.innerHeight || 1;
        var p = clamp01(window.scrollY / vh);

        if (heroCopy) {
            heroCopy.style.transform = 'translate3d(0,' + (p * 120) + 'px,0)';
            heroCopy.style.opacity = String(1 - p * 1.2);
        }
        if (heroSub) {
            heroSub.style.transform = 'translate3d(0,' + (p * 90) + 'px,0)';
            heroSub.style.opacity = String(1 - p * 1.2);
        }
        if (heroCue) {
            heroCue.style.transform = 'translate3d(0,' + (p * 70) + 'px,0)';
            heroCue.style.opacity = String(Math.max(0, 1 - p * 3));
        }
        if (heroSvgLeft) {
            heroSvgLeft.style.transform = 'translate3d(0,' + (-p * 180) + 'px,0)';
        }
        if (heroSvgRight) {
            heroSvgRight.style.transform = 'translate3d(0,' + (-p * 180) + 'px,0) rotate(-15deg)';
        }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            onParallax();
            ticking = false;
        });
    }, { passive: true });
    onParallax();

    /* ---------- Navbar scroll state ---------- */
    var navbar = document.getElementById('navbar');

    function onScroll() {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('is-scrolled');
        } else {
            navbar.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    var toggle = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');

    function toggleMenu(force) {
        if (!toggle || !mobileMenu) return;
        var shouldOpen = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('is-open');
        mobileMenu.classList.toggle('is-open', shouldOpen);
        toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
    }

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', function () { toggleMenu(); });
        // Close menu when a link is tapped
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { toggleMenu(false); });
        });

        // Close menu when clicking anywhere outside of it
        document.addEventListener('click', function (e) {
            if (!mobileMenu.classList.contains('is-open')) return;
            if (mobileMenu.contains(e.target) || toggle.contains(e.target)) return;
            toggleMenu(false);
        });
    }

    /* ---------- Smooth anchor scrolling ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = anchor.getAttribute('href');
            if (targetId.length < 2) return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var top = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ---------- Reveal on scroll ---------- */
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el, i) {
            var delay = (i % 3) * 90;
            el.style.transitionDelay = delay + 'ms';
            observer.observe(el);
        });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Animated counters ---------- */
    function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start = null;

        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var val = Math.round(target * eased);
            el.textContent = val + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

    if (counters.length && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
        counters.forEach(function (el) {
            el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
        });
    }
/* ---------- Why Otharo Is Different — proportional fan ---------- */
    var deck = document.querySelector('.diff-deck');
    var deckCards = deck ? Array.prototype.slice.call(deck.querySelectorAll('.diff-card')) : [];

    function getFanBase() {
        if (deckCards.length < 2) return 0;
        var a = deckCards[0].getBoundingClientRect();
        var b = deckCards[1].getBoundingClientRect();
        var gap = b.left - a.left;
        var overlap = Math.min(a.width, b.width) - gap;
        if (!isFinite(overlap) || overlap < 0) return 56;
        return Math.max(32, overlap * 1.9);
    }

    var FAN_BASE = getFanBase();

    window.addEventListener('resize', function () { FAN_BASE = getFanBase(); });

    function spreadDeck(index) {
        deckCards.forEach(function (card, j) {
            if (j === index) return;
            var dir = j < index ? -1 : 1;
            card.style.transform = 'translateX(' + (dir * FAN_BASE) + 'px)';
        });
    }

    function resetDeck() {
        deckCards.forEach(function (card) {
            card.style.transform = '';
        });
    }

    deckCards.forEach(function (card, i) {
        card.addEventListener('mouseenter', function () {
            spreadDeck(i);
        });
    });

    if (deck) {
        deck.addEventListener('mouseleave', resetDeck);
    }

    if (window.matchMedia('(hover: none)').matches) {
        resetDeck();
    }
/* ---------- Incubation Roadmap ---------- */
    var roadmapData = [
        {
            n: '1',
            title: 'Interview & Application Process',
            type: 'p',
            parts: [
                { t: 'Start by having interested early-stage startups ', u: false },
                { t: 'fill the application form', u: true },
                { t: ' and clear the ', u: false },
                { t: 'interview round', u: true },
                { t: ' with our team.', u: false }
            ]
        },
        {
            n: '2',
            title: 'Kick Off',
            type: 'p',
            parts: [
                { t: 'A day dedicated to ', u: false },
                { t: 'welcoming the new cohort of startups', u: true },
                { t: ' into the Otharo program.', u: false }
            ]
        },
        {
            n: '3',
            title: 'Preliminary Meeting',
            type: 'p',
            parts: [
                { t: 'An ', u: false },
                { t: 'in-depth meeting', u: true },
                { t: ' with founders to understand their venture, team, and goals.', u: false }
            ]
        },
        {
            n: '4',
            title: 'Mentor\u2019s Meet Up',
            type: 'p',
            parts: [
                { t: 'Connect with your dedicated mentor, ', u: false },
                { t: 'set milestones', u: true },
                { t: ' for the journey, and get ', u: false },
                { t: 'paired with mentors', u: true },
                { t: ' who fit your sector.', u: false }
            ]
        },
        {
            n: '5',
            title: 'Sessions + Coaching',
            type: 'list',
            parts: [
                { t: 'Different tailored sessions', u: true },
                { t: 'Mentor one on one', u: true },
                { t: 'Personalized coaching', u: true }
            ],
            closing: [
                { t: 'All leading to a ', u: false },
                { t: 'meet-and-greet', u: true },
                { t: ' with the wider ecosystem.', u: false }
            ]
        },
        {
            n: '6',
            title: 'Demo Day',
            type: 'p',
            parts: [
                { t: 'Showcase your traction and pitch to investors, partners, and the public — ready to raise your next round.', u: false }
            ]
        }
    ];

    var road = document.getElementById('roadmap-svg');
    var roadMobile = document.getElementById('roadmap-mobile');
    var roadDesktop = document.getElementById('roadmap-desktop');
    var roadCanvas = roadDesktop ? roadDesktop.querySelector('.roadmap-canvas') : null;

    function buildSmoothPath(points) {
        var d = 'M ' + points[0].x + ',' + points[0].y;
        for (var i = 1; i < points.length; i++) {
            var p0 = points[i - 1];
            var p1 = points[i];
            var p2 = points[i + 1] || points[i];
            var c1x = p0.x + (p1.x - p0.x) / 2;
            var c1y = p0.y + (p1.y - p0.y) / 2;
            var c2x = p1.x - (p1.x - p0.x) / 2;
            var c2y = p1.y - (p1.y - p0.y) / 2;
            d += ' C ' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + p1.x + ',' + p1.y;
        }
        return d;
    }

    function renderCopy(phase) {
        var html = '<h3>' + phase.title + '</h3>';

        if (phase.type === 'list') {
            html += '<ul>';
            (phase.parts || []).forEach(function (part, i) {
                html += '<li>' + (part.u ? '<u>' : '') + part.t + (part.u ? '</u>' : '') + '</li>';
            });
            html += '</ul>';
            if (phase.closing) {
                html += '<p>';
                phase.closing.forEach(function (part) {
                    html += (part.u ? '<u>' : '') + part.t + (part.u ? '</u>' : '');
                });
                html += '</p>';
            }
        } else {
            html += '<p>';
            (phase.parts || []).forEach(function (part) {
                html += (part.u ? '<u>' : '') + part.t + (part.u ? '</u>' : '');
            });
            html += '</p>';
        }
        return html;
    }

    function buildDesktopRoad() {
        if (!road || !roadDesktop || !roadCanvas) return;

        var W = 2400, H = 540;

        /* crest points: phases at the top of each curve */
        var crestY = 150, dipY = 370;
        var crestXs = [260, 620, 980, 1340, 1700, 2060];

        var pts = [{ x: 0, y: 260 }];
        for (var i = 0; i < 6; i++) {
            pts.push({ x: crestXs[i], y: i % 2 === 0 ? crestY : crestY + 20 });
            if (i < 5) {
                var mid = (crestXs[i] + crestXs[i + 1]) / 2;
                pts.push({ x: mid, y: dipY });
            }
        }
        pts.push({ x: 2400, y: 320 });

        var d = buildSmoothPath(pts);
        var svg = '';
        svg += '<path class="road-line-shadow" d="' + d + '"/>';
        svg += '<path class="road-line" d="' + d + '"/>';
        svg += '<path class="road-lane" d="' + d + '"/>';
        road.innerHTML = svg;

        var badges = roadCanvas.querySelectorAll('.road-badge, .road-copy');
        badges.forEach(function (el) { el.parentNode.removeChild(el); });

        roadmapData.forEach(function (phase, i) {
            var x = crestXs[i];
            var y = i % 2 === 0 ? crestY : crestY + 20;

            var badge = document.createElement('div');
            badge.className = 'road-badge';
            badge.style.left = x + 'px';
            badge.style.top = y + 'px';
            badge.innerHTML = '<small>Phase</small><strong>' + phase.n + '</strong>';

            var copy = document.createElement('div');
            copy.className = 'road-copy';
            copy.style.left = x + 'px';
            copy.style.top = '210px';
            copy.innerHTML = renderCopy(phase);

            roadCanvas.appendChild(badge);
            roadCanvas.appendChild(copy);
        });
    }

    function buildMobileRoad() {
        if (!roadMobile) return;
        roadMobile.innerHTML = '';

        var W = roadMobile.clientWidth || 360;
        var rowH = Math.max(235, W * 0.5);
        var svgH = rowH * 6 + 160;
        var cx = (W * 0.30 + W * 0.70) / 2;

        /* alternate crest x positions (left/right) down the vertical snake */
        var crestXs = [W * 0.30, W * 0.70];
        var pts = [{ x: cx, y: 20 }];
        var y;
        for (var i = 0; i < 6; i++) {
            y = 120 + i * rowH;
            pts.push({ x: crestXs[i % 2], y: y });
        }
        pts.push({ x: cx, y: svgH - 20 });

        var d = buildSmoothPath(pts);
        var svg = document.createElement('svg');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + svgH);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.className = 'roadmap-v-svg';
        svg.innerHTML =
            '<path class="road-line-shadow" d="' + d + '"/>' +
            '<path class="road-line" d="' + d + '"/>' +
            '<path class="road-lane" d="' + d + '"/>';
        roadMobile.appendChild(svg);

        roadmapData.forEach(function (phase, i) {
            y = 120 + i * rowH;
            var x = crestXs[i % 2];
            var isLeft = i % 2 === 0;

            var badge = document.createElement('div');
            badge.className = 'road-badge';
            badge.style.left = x + 'px';
            badge.style.top = y + 'px';
            badge.innerHTML = '<small>Phase</small><strong>' + phase.n + '</strong>';

            var copy = document.createElement('div');
            copy.className = 'vphase vphase-copy';
            if (isLeft) {
                copy.style.left = (x + 58) + 'px';
                copy.style.textAlign = 'left';
                copy.style.width = (W - x - 58 - 20) + 'px';
            } else {
                copy.style.right = (W - x + 58) + 'px';
                copy.style.textAlign = 'right';
                copy.style.width = (x - 58 - 20) + 'px';
            }
            copy.style.top = (y - 12) + 'px';
            copy.innerHTML = renderCopy(phase);

            roadMobile.appendChild(badge);
            roadMobile.appendChild(copy);
        });

        roadMobile.style.height = svgH + 'px';
    }

    if (road || roadMobile) {
        buildDesktopRoad();
        buildMobileRoad();
        window.addEventListener('resize', buildMobileRoad);
    }
})();
