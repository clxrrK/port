/* ============================================================
   Clark Kint De Nava — Portfolio Interactions
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar: scrolled state + scroll progress ---------- */
  var navbar = document.getElementById('navbar');
  var progress = document.getElementById('scrollProgress');
  var backToTopBtn = document.getElementById('backToTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) {
      navbar.classList.toggle('scrolled', y > 24);
    }

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', y > 350);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Back to Top ---------- */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks || !toggle) return;
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Active section indicator ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  if ('IntersectionObserver' in window && sections.length > 0) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        links.forEach(function (link) {
          var targetId = link.getAttribute('href');
          link.classList.toggle('active', targetId === '#' + id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Scroll reveal animations ---------- */
  var revealEls = document.querySelectorAll('.fade-up, .reveal');

  if (reducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    /* Hero entrance: trigger immediately on load */
    requestAnimationFrame(function () {
      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('visible');
      });
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Hero Ambient Mouse Glow ---------- */
  var heroSection = document.getElementById('home');
  var heroGlow = document.getElementById('heroGlow');

  if (heroSection && heroGlow && window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
    var isHeroHovered = false;

    heroSection.addEventListener('mouseenter', function () {
      isHeroHovered = true;
      heroGlow.style.opacity = '1';
    });

    heroSection.addEventListener('mouseleave', function () {
      isHeroHovered = false;
      heroGlow.style.opacity = '0';
    });

    heroSection.addEventListener('mousemove', function (e) {
      if (!isHeroHovered) return;
      var rect = heroSection.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      heroGlow.style.left = x + 'px';
      heroGlow.style.top = y + 'px';
    });
  }

  /* ---------- Featured Projects Carousel ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.carousel-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dot'));
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var currentDisplay = document.getElementById('carouselCurrent');
  var carouselContainer = document.getElementById('heroCarousel');

  var currentSlide = 0;
  var totalSlides = slides.length;
  var autoplayTimer = null;

  function goToSlide(index) {
    if (totalSlides === 0) return;
    currentSlide = (index + totalSlides) % totalSlides;

    slides.forEach(function (slide, i) {
      var isActive = (i === currentSlide);
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach(function (dot, i) {
      var isActive = (i === currentSlide);
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    if (currentDisplay) {
      currentDisplay.textContent = (currentSlide + 1 < 10 ? '0' : '') + (currentSlide + 1);
    }
  }

  if (totalSlides > 0) {
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
        restartAutoplay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          restartAutoplay();
        }
      });
    });

    /* Keyboard navigation */
    if (carouselContainer) {
      carouselContainer.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          goToSlide(currentSlide - 1);
          restartAutoplay();
        } else if (e.key === 'ArrowRight') {
          goToSlide(currentSlide + 1);
          restartAutoplay();
        }
      });
    }

    /* Subtle autoplay every 8 seconds, pausing on hover */
    function startAutoplay() {
      if (reducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        goToSlide(currentSlide + 1);
      }, 8000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopAutoplay);
      carouselContainer.addEventListener('mouseleave', startAutoplay);
      carouselContainer.addEventListener('focusin', stopAutoplay);
      carouselContainer.addEventListener('focusout', startAutoplay);
    }

    startAutoplay();
  }

  /* ---------- Contact Form Handling ---------- */
  var contactForm = document.getElementById('contactForm');
  var formSuccessCard = document.getElementById('formSuccessCard');
  var formAlert = document.getElementById('formAlert');
  var submitBtn = document.getElementById('submitBtn');
  var resetFormBtn = document.getElementById('resetFormBtn');
  var directMailtoBtn = document.getElementById('directMailtoBtn');
  var successDesc = document.getElementById('successDesc');

  var nameInput = document.getElementById('contactName');
  var emailInput = document.getElementById('contactEmail');
  var subjectInput = document.getElementById('contactSubject');
  var messageInput = document.getElementById('contactMessage');

  var nameError = document.getElementById('nameError');
  var emailError = document.getElementById('emailError');
  var subjectError = document.getElementById('subjectError');
  var messageError = document.getElementById('messageError');

  function clearErrors() {
    [nameInput, emailInput, subjectInput, messageInput].forEach(function (inp) {
      if (inp) inp.classList.remove('error');
    });
    [nameError, emailError, subjectError, messageError].forEach(function (err) {
      if (err) err.textContent = '';
    });
    if (formAlert) {
      formAlert.style.display = 'none';
      formAlert.textContent = '';
      formAlert.className = 'form-alert';
    }
  }

  // Clear individual field error on user typing
  [
    { input: nameInput, err: nameError },
    { input: emailInput, err: emailError },
    { input: subjectInput, err: subjectError },
    { input: messageInput, err: messageError }
  ].forEach(function (pair) {
    if (pair.input) {
      pair.input.addEventListener('input', function () {
        pair.input.classList.remove('error');
        if (pair.err) pair.err.textContent = '';
      });
    }
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var nameVal = (nameInput.value || '').trim();
      var emailVal = (emailInput.value || '').trim();
      var subjectVal = (subjectInput.value || '').trim();
      var messageVal = (messageInput.value || '').trim();

      var hasError = false;
      var firstInvalidInput = null;

      if (!nameVal || nameVal.length < 2) {
        hasError = true;
        nameInput.classList.add('error');
        nameError.textContent = 'Please enter your name (at least 2 characters).';
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      }

      if (!emailVal || !validateEmail(emailVal)) {
        hasError = true;
        emailInput.classList.add('error');
        emailError.textContent = 'Please enter a valid email address.';
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      }

      if (!subjectVal || subjectVal.length < 2) {
        hasError = true;
        subjectInput.classList.add('error');
        subjectError.textContent = 'Please enter a subject.';
        if (!firstInvalidInput) firstInvalidInput = subjectInput;
      }

      if (!messageVal || messageVal.length < 5) {
        hasError = true;
        messageInput.classList.add('error');
        messageError.textContent = 'Please write a message (at least 5 characters).';
        if (!firstInvalidInput) firstInvalidInput = messageInput;
      }

      if (hasError) {
        if (firstInvalidInput) firstInvalidInput.focus();
        if (formAlert) {
          formAlert.className = 'form-alert form-alert--error';
          formAlert.textContent = 'Please fill out all required fields correctly before sending.';
          formAlert.style.display = 'block';
        }
        return;
      }

      // Enter loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      // Build prepared mailto string
      var mailSubject = encodeURIComponent(subjectVal);
      var mailBody = encodeURIComponent(
        'Hi Clark,\n\n' + messageVal + '\n\n---\nFrom: ' + nameVal + ' (' + emailVal + ')'
      );
      var mailtoUrl = 'mailto:denavaclark@gmail.com?subject=' + mailSubject + '&body=' + mailBody;

      // Realistic UX transition (600ms)
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        // Show success state
        contactForm.style.display = 'none';
        if (formSuccessCard) {
          formSuccessCard.style.display = 'flex';
        }

        if (successDesc) {
          successDesc.textContent =
            'Thank you, ' + nameVal + '! Your message has been prepared for denavaclark@gmail.com. Click the button below to launch your email client.';
        }

        if (directMailtoBtn) {
          directMailtoBtn.setAttribute('href', mailtoUrl);
        }

        // Trigger mailto directly
        try {
          window.location.href = mailtoUrl;
        } catch (err) {
          // Fallback if browser blocks automatic protocol handler
        }
      }, 650);
    });
  }

  if (resetFormBtn && contactForm) {
    resetFormBtn.addEventListener('click', function () {
      contactForm.reset();
      clearErrors();
      if (formSuccessCard) formSuccessCard.style.display = 'none';
      contactForm.style.display = 'flex';
      if (nameInput) nameInput.focus();
    });
  }

})();
