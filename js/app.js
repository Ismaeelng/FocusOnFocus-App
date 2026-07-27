/* ==========================================================================
   FocusOnFocus (FonF) - Main Application Bootstrap & Router
   ========================================================================== */

import { store } from './store.js';
import { renderHomeDashboard } from './components/dashboard.js';
import { renderTasksView } from './components/tasks.js';
import { renderInsightsView } from './components/insights.js';
import { renderFocusView } from './components/focus.js';
import { renderSettingsView } from './components/settings.js';
import { checkAndRenderFreezeOverlay } from './components/overlay.js';
import { renderPermissionOnboarding } from './components/onboarding.js';

let currentTab = 'home';
let activeLinkedTaskTitle = null;

document.addEventListener('DOMContentLoaded', () => {
  const state = store.getState();
  
  // Apply saved theme
  if (state.theme) {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcons(state.theme);
  }

  // Bind top bar header streak counter & theme toggle
  bindTopBar();

  // Bind Bottom Navigation tabs
  bindBottomNav();

  // Render initial view
  renderCurrentView();

  // Check permission onboarding on initial load
  const modalContainer = document.getElementById('modal-container');
  renderPermissionOnboarding(modalContainer, () => {
    renderCurrentView();
  });

  // Real-time interval monitoring for app limits & schedule blocks
  setInterval(() => {
    const freezeSlot = document.getElementById('freeze-overlay-container');
    checkAndRenderFreezeOverlay(freezeSlot);
  }, 4000);

  // Subscribe to store updates
  store.subscribe((data) => {
    updateThemeIcons(data.theme);
    const streakVal = document.getElementById('streak-count-val');
    if (streakVal) streakVal.textContent = data.streakDays;
  });
});

function bindTopBar() {
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    store.toggleTheme();
  });
}

function updateThemeIcons(theme) {
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (theme === 'dark') {
    sun?.classList.add('hidden');
    moon?.classList.remove('hidden');
  } else {
    sun?.classList.remove('hidden');
    moon?.classList.add('hidden');
  }
}

function bindBottomNav() {
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      navigateToTab(targetTab);
    });
  });
}

function navigateToTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.nav-tab').forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  renderCurrentView();
}

function renderCurrentView() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  switch (currentTab) {
    case 'home':
      renderHomeDashboard(mainContent, navigateToTab, (taskTitle) => {
        activeLinkedTaskTitle = taskTitle;
        navigateToTab('focus');
      });
      break;

    case 'tasks':
      renderTasksView(mainContent, (taskTitle) => {
        activeLinkedTaskTitle = taskTitle;
        navigateToTab('focus');
      });
      break;

    case 'insights':
      renderInsightsView(mainContent);
      break;

    case 'focus':
      renderFocusView(mainContent, activeLinkedTaskTitle, () => {
        activeLinkedTaskTitle = null;
        navigateToTab('home');
      });
      break;

    case 'settings':
      renderSettingsView(mainContent);
      break;

    default:
      renderHomeDashboard(mainContent, navigateToTab, (taskTitle) => {
        activeLinkedTaskTitle = taskTitle;
        navigateToTab('focus');
      });
  }
}
