/**
 * ==============================================================================
 * DR. RABEYA BASRI - THEME MANAGER (Rose & Teal / Ocean Sapphire / Midnight Dark)
 * ==============================================================================
 * Provides instant synchronous hydration to avoid flash-of-theme (FOUC),
 * smooth theme cycling, localStorage persistence, and cross-tab/cross-page sync.
 * ==============================================================================
 */

(function () {
  'use strict';

  var THEMES = ['rose', 'ocean', 'dark'];
  var THEME_LABELS = {
    rose: { icon: '🌸', name: 'Signature Rose & Teal', next: 'ocean' },
    ocean: { icon: '💎', name: 'Ocean Sapphire & Cyan', next: 'dark' },
    dark: { icon: '🌙', name: 'Midnight Medical Dark', next: 'rose' }
  };

  // Immediate synchronous hydration
  function getStoredTheme() {
    try {
      var saved = localStorage.getItem('app_theme');
      if (saved && THEMES.indexOf(saved) !== -1) {
        return saved;
      }
      // Check system preference if no manual override
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // Fallback if localStorage unavailable
    }
    return 'rose';
  }

  var currentTheme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Global API
  window.ThemeManager = {
    themes: THEMES,
    labels: THEME_LABELS,
    getCurrentTheme: function () {
      return document.documentElement.getAttribute('data-theme') || currentTheme;
    },
    setTheme: function (theme) {
      if (THEMES.indexOf(theme) === -1) theme = 'rose';
      currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('app_theme', theme);
      } catch (e) {}

      updateThemeUI(theme);

      // Dispatch custom event for charts or dynamic components
      var event = new CustomEvent('themechange', { detail: { theme: theme } });
      window.dispatchEvent(event);
    },
    cycleTheme: function () {
      var current = window.ThemeManager.getCurrentTheme();
      var next = (THEME_LABELS[current] && THEME_LABELS[current].next) || 'rose';
      window.ThemeManager.setTheme(next);
      return next;
    }
  };

  function updateThemeUI(theme) {
    var meta = THEME_LABELS[theme] || THEME_LABELS.rose;

    // Update all theme toggle buttons on the page
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.setAttribute('data-current-theme', theme);
      btn.setAttribute('title', 'Current Theme: ' + meta.name + ' (Click to change)');
      var iconSpan = btn.querySelector('.theme-btn-icon');
      if (iconSpan) {
        iconSpan.textContent = meta.icon;
      }
      var labelSpan = btn.querySelector('.theme-btn-label');
      if (labelSpan) {
        labelSpan.textContent = meta.name;
      }
    });

    // Update any theme radio or option cards in Settings
    document.querySelectorAll('[data-theme-option]').forEach(function (card) {
      if (card.getAttribute('data-theme-option') === theme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // Bind click handlers when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    updateThemeUI(window.ThemeManager.getCurrentTheme());

    // Bind all theme toggles
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        e.preventDefault();
        var nextTheme = window.ThemeManager.cycleTheme();
        // Show subtle micro toast or feedback
        if (typeof window.showToast === 'function') {
          window.showToast('Theme switched to ' + THEME_LABELS[nextTheme].name, 'info');
        }
      }

      var optionCard = e.target.closest('[data-theme-option]');
      if (optionCard) {
        var chosenTheme = optionCard.getAttribute('data-theme-option');
        if (chosenTheme) {
          window.ThemeManager.setTheme(chosenTheme);
        }
      }
    });
  });
})();
