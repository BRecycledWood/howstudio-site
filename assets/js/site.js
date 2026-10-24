/* ==========================================================================
   HOWstud.io — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Header scroll state ---------- */
  var header = doc.querySelector('[data-header]');
  if (header) {
    var lastState = null;
    var onScroll = function () {
      var scrolled = window.scrollY > 8;
      if (scrolled !== lastState) {
        header.classList.toggle('is-scrolled', scrolled);
        lastState = scrolled;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = doc.querySelector('[data-nav-toggle]');
  var nav = doc.querySelector('[data-nav]');
  var navLabel = toggle ? toggle.querySelector('[data-nav-label]') : null;

  var setNav = function (open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('nav-open', open);
    if (navLabel) navLabel.textContent = open ? 'Close menu' : 'Open menu';
    if (open) {
      var first = nav.querySelector('a, button');
      if (first) first.focus({ preventScroll: true });
    }
  };

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 959 && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
      }
    });
  }

  /* ---------- Current page highlight (safety net for static pages) ---------- */
  var path = window.location.pathname.replace(/\/+$/, '');
  var current = path.split('/').pop() || 'index.html';
  doc.querySelectorAll('.nav-list a').forEach(function (link) {
    var href = (link.getAttribute('href') || '').split('#')[0];
    if (href && href === current) {
      link.setAttribute('aria-current', 'page');
    } else if (href && href !== 'index.html') {
      link.removeAttribute('aria-current');
    }
  });

  /* ---------- Scroll reveals ---------- */
  var revealItems = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));

  if (revealItems.length) {
    var revealAll = function () {
      revealItems.forEach(function (el) {
        el.classList.add('is-revealed');
      });
    };

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      revealAll();
    } else {
      var show = function (el) {
        el.classList.add('is-revealed');
        if (observer) observer.unobserve(el);
      };

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) show(entry.target);
          });
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0 }
      );

      /* Reveal what is already on screen straight away */
      revealItems.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) {
          show(el);
        } else {
          observer.observe(el);
        }
      });

      /* Safety net: keyboard paging, anchor jumps and fast scrolls can move the
         viewport without the observer firing for every element. */
      var queued = false;
      var checkVisible = function () {
        queued = false;
        revealItems.forEach(function (el) {
          if (el.classList.contains('is-revealed')) return;
          var box = el.getBoundingClientRect();
          if (box.top < window.innerHeight - 40 && box.bottom > -40) show(el);
        });
      };
      var queueCheck = function () {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(checkVisible);
      };

      window.addEventListener('scroll', queueCheck, { passive: true });
      window.addEventListener('resize', queueCheck);
      window.addEventListener('load', queueCheck);
      window.setTimeout(queueCheck, 900);
    }
  }

  /* ---------- Ticker: build a seamless, screen-filling loop ---------- */
  var track = doc.querySelector('[data-ticker-track]');
  if (track) {
    var base = track.querySelector('.ticker__group');
    if (base) {
      var baseWidth = base.getBoundingClientRect().width;
      if (baseWidth > 0) {
        var copies = Math.max(1, Math.ceil(window.innerWidth / baseWidth) + 1);
        var half = doc.createDocumentFragment();
        for (var i = 0; i < copies; i++) {
          half.appendChild(base.cloneNode(true));
        }
        var second = half.cloneNode(true);
        track.textContent = '';
        track.appendChild(half);
        track.appendChild(second);
        track.style.animationDuration = (baseWidth * copies) / 46 + 's';
      }
    }
  }

  /* ---------- Pre-select a service from a query string ---------- */
  var serviceField = doc.querySelector('#service');
  if (serviceField) {
    var requested = new URLSearchParams(window.location.search).get('service');
    if (requested) {
      var match = Array.prototype.find.call(serviceField.options, function (option) {
        return option.value.toLowerCase() === requested.toLowerCase() ||
          option.textContent.toLowerCase() === requested.toLowerCase();
      });
      if (match) serviceField.value = match.value;
    }
  }

  /* ---------- Footer year ---------- */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Project inquiry form ---------- */
  var form = doc.querySelector('[data-project-form]');
  if (!form) return;

  var success = doc.querySelector('[data-form-success]');
  var status = doc.querySelector('[data-form-status]');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit ? submit.querySelector('.btn-label') : null;
  var startedAt = Date.now();
  var requiredNote = 'This one is needed.';

  var fieldMap = {
    name: {
      validate: function (v) {
        return v.trim().length >= 2 || 'Please tell us your name.';
      }
    },
    email: {
      validate: function (v) {
        var value = v.trim();
        if (!value) return 'We need an email address to reply to.';
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
          return 'That email address does not look right — please check it.';
        }
        return true;
      }
    },
    message: {
      validate: function (v) {
        var value = v.trim();
        if (value.length < 10) return 'A sentence or two about the project is all we need.';
        if (value.length > 4000) return 'Please keep this under 4,000 characters.';
        return true;
      }
    },
    consent: {
      validate: function (v, field) {
        return field.checked || 'Please confirm we can reply to your message.';
      }
    }
  };

  var getField = function (name) {
    return form.elements.namedItem(name);
  };

  var setError = function (name, message) {
    var field = getField(name);
    if (!field) return;
    var wrapper = field.closest('.field') || field.closest('.checkbox');
    var errorEl = wrapper ? wrapper.querySelector('.field-error') : null;
    if (!wrapper) return;
    if (message === true || message === '') {
      wrapper.removeAttribute('data-invalid');
      field.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    } else {
      wrapper.setAttribute('data-invalid', 'true');
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    }
  };

  var validateName = function (name) {
    var field = getField(name);
    var rule = fieldMap[name];
    if (!field || !rule) return true;
    var result = rule.validate(field.type === 'checkbox' ? field.checked : field.value, field);
    setError(name, result);
    return result === true;
  };

  Object.keys(fieldMap).forEach(function (name) {
    var field = getField(name);
    if (!field) return;
    field.addEventListener('blur', function () {
      validateName(name);
    });
    field.addEventListener('input', function () {
      var wrapper = field.closest('.field') || field.closest('.checkbox');
      if (wrapper && wrapper.getAttribute('data-invalid') === 'true') validateName(name);
    });
    field.addEventListener('change', function () {
      var wrapper = field.closest('.field') || field.closest('.checkbox');
      if (wrapper && wrapper.getAttribute('data-invalid') === 'true') validateName(name);
    });
  });

  var showStatus = function (message) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-visible', Boolean(message));
  };

  var setBusy = function (busy) {
    if (!submit) return;
    submit.setAttribute('aria-busy', busy ? 'true' : 'false');
    submit.disabled = busy;
    if (submitLabel) submitLabel.textContent = busy ? 'Sending' : "Let's Figure It Out";
  };

  var collect = function () {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.type === 'hidden') return;
      data[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
    return data;
  };

  var storeLead = function (payload) {
    try {
      var key = 'howstudio:pending-leads';
      var existing = JSON.parse(window.localStorage.getItem(key) || '[]');
      existing.push(payload);
      window.localStorage.setItem(key, JSON.stringify(existing.slice(-10)));
    } catch (err) {
      /* storage can be unavailable — the form still works without it */
    }
  };

  var mailtoFor = function (data) {
    var lines = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      'Company: ' + (data.company || '—'),
      'Service: ' + (data.service || '—'),
      'Budget: ' + (data.budget || '—'),
      'Timeline: ' + (data.timeline || '—'),
      '',
      data.message
    ];
    return (
      'mailto:hello@howstud.io?subject=' +
      encodeURIComponent('New project inquiry — ' + data.name) +
      '&body=' +
      encodeURIComponent(lines.join('\n'))
    );
  };

  var finish = function (payload, delivery) {
    form.hidden = true;
    form.setAttribute('aria-hidden', 'true');
    if (!success) return;
    success.classList.add('is-visible');
    var emailLine = success.querySelector('[data-success-email]');
    if (emailLine) emailLine.textContent = payload.email;
    var fallback = success.querySelector('[data-success-fallback]');
    if (fallback) {
      fallback.hidden = false;
      var mailLink = fallback.querySelector('[data-mailto]');
      if (mailLink) mailLink.href = mailtoFor(payload);
    }
    var heading = success.querySelector('[data-success-title]');
    success.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    if (heading) heading.focus({ preventScroll: true });
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showStatus('');

    var results = Object.keys(fieldMap).map(validateName);
    var firstInvalid = form.querySelector('[data-invalid="true"]');
    if (results.indexOf(false) !== -1) {
      if (firstInvalid) {
        var target = firstInvalid.querySelector('input, select, textarea');
        if (target) target.focus();
      }
      showStatus('Please check the highlighted fields and try again.');
      return;
    }

    var data = collect();

    /* Honeypot + time-on-page spam checks (silent, never punish real users) */
    if (data.company_website) {
      finish(data, 'endpoint');
      form.reset();
      return;
    }
    if (Date.now() - startedAt < 1200) {
      showStatus('That was quick — give it a second and try again.');
      return;
    }

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var payload = {
      name: data.name,
      email: data.email,
      company: data.company || '',
      service: data.service || '',
      budget: data.budget || '',
      timeline: data.timeline || '',
      message: data.message,
      consent: Boolean(data.consent),
      page: window.location.href,
      submittedAt: new Date().toISOString()
    };

    setBusy(true);
    showStatus('');

    if (!endpoint) {
      /* No endpoint connected yet: keep a recoverable local record and hand
         the message to the visitor's mail app so nothing is lost. */
      storeLead(payload);
      setBusy(false);
      window.setTimeout(function () {
        window.location.href = mailtoFor(payload);
        finish(payload, 'mailto');
        form.reset();
      }, 220);
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed with ' + response.status);
        return response.json().catch(function () {
          return {};
        });
      })
      .then(function () {
        setBusy(false);
        finish(payload, 'endpoint');
        form.reset();
      })
      .catch(function () {
        setBusy(false);
        storeLead(payload);
        showStatus(
          'Something went wrong sending that. Please try again, or email hello@howstud.io directly.'
        );
      });
  });

  /* Keep an accessible live region for async feedback */
  if (status) {
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
  }
})();
