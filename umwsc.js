/* UMWSC — shared behaviour: sticky-nav state + mobile drawer */
(function () {
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');

  // Home page nav is transparent over the hero and goes solid on scroll.
  if (nav && nav.classList.contains('nav--overlay')) {
    var setNav = function () { nav.classList.toggle('solid', window.scrollY > 30); };
    setNav();
    window.addEventListener('scroll', setNav, { passive: true });
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close the drawer if the window grows past the mobile breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth > 920) {
        drawer.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
