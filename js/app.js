/* ==========================================================================
   FocusOnFocus (FonF) - Main Application Router & Event Orchestrator
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
  
  if (state.theme) {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcons(state.theme);
  }

  bindHeaderControls();
  bindNavigation();
  renderCurrentView();

  // Permission onboarding check
  const modalContainer = document.getElementById('modal-container');
  renderPermissionOnboarding(modalContainer, () => {
    renderCurrentView();
  });

  // Real-time interval check for app limits & debounced overlay
  setInterval(() => {
    const freezeSlot = document.getElementById('freeze-overlay-container');
    checkAndRenderFreezeOverlay(freezeSlot);
  }, 4000);

  // Subscribe to state updates
  store.subscribe((data) => {
    updateThemeIcons(data.theme);
    const streakVal = document.getElementById('streak-count-val');
    if (streakVal) streakVal.textContent = data.streakDays;
  });
});

function bindHeaderControls() {
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

function bindNavigation() {
  // Mobile bottom nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      navigateToTab(targetTab);
    });
  });

  // Desktop sidebar menu items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      navigateToTab(targetTab);
    });
  });
}

function navigateToTab(tabName) {
  currentTab = tabName;

  // Update active state in bottom nav
  document.querySelectorAll('.nav-tab').forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update active state in sidebar
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
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
