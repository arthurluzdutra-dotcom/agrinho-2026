// script.js
// Código para abas acessíveis, deep-linking, scroll suave e destaque do menu
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function activateTab(button, focusPanel = false) {
    tabButtons.forEach(b => {
      const selected = b === button;
      b.setAttribute('aria-selected', selected ? 'true' : 'false');
      b.tabIndex = selected ? 0 : -1;
    });
    tabPanels.forEach(panel => {
      const active = panel.id === button.getAttribute('aria-controls');
      panel.dataset.active = active ? 'true' : 'false';
    });
    // Atualiza hash sem rolar a página
    const hash = '#' + button.getAttribute('aria-controls');
    history.replaceState(null, '', hash);
    if (focusPanel) {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (panel) panel.focus();
    }
  }

  if (tabButtons.length) {
    // inicializa tabindex
    tabButtons.forEach((b) => b.tabIndex = b.getAttribute('aria-selected') === 'true' ? 0 : -1);

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn, true));
      btn.addEventListener('keydown', (e) => {
        const idx = tabButtons.indexOf(btn);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = tabButtons[(idx + 1) % tabButtons.length];
          activateTab(next, true);
          next.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
          activateTab(prev, true);
          prev.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          activateTab(tabButtons[0], true);
          tabButtons[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          activateTab(tabButtons[tabButtons.length - 1], true);
          tabButtons[tabButtons.length - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab(btn, true);
        }
      });
    });

    // Deep-linking: abrir aba por hash ex: #tab-inovacao
    if (location.hash) {
      const target = document.querySelector(`[aria-controls="${location.hash.slice(1)}"]`);
      if (target) activateTab(target, false);
    }
  }

  // Smooth scroll para links de navegação
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', a.getAttribute('href'));
      }
    });
  });

  // Destaque do menu conforme scroll (IntersectionObserver)
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { root: null, threshold: 0.45 });

    sections.forEach(s => observer.observe(s));
  } else {
    // Fallback: highlight baseado em scroll position
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + (window.innerHeight / 3);
      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const link = navLinks.find(a => a.getAttribute('href') === `#${section.id}`);
        if (link) {
          if (scrollPos >= top && scrollPos < bottom) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      });
    }, { passive: true });
  }
});
