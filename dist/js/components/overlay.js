/* ==========================================================================
   FocusOnFocus (FonF) - Freeze / Limit Reached Overlay Component
   ========================================================================== */

import { store } from '../store.js';

export function checkAndRenderFreezeOverlay(container) {
  const state = store.getState();
  if (!state.settings.globalFreezeEnabled) {
    container.innerHTML = '';
    return;
  }

  // Find if any app has exceeded its limit
  const blockedApp = state.apps.find(app => app.minutesUsed >= app.dailyLimitMinutes);
  if (!blockedApp) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="freeze-fullscreen">
      <div class="freeze-icon">${blockedApp.icon}</div>
      <h2 class="freeze-title">Daily Limit Reached</h2>
      <p class="freeze-msg">
        You've reached your limit for <strong>${blockedApp.name}</strong> today 💜 Time to take a mindful break and stretch!
      </p>

      <div class="freeze-actions">
        <button class="btn-purple" id="btn-freeze-close">
          Close App & Return to Home
        </button>
        <button class="btn-outline-light" id="btn-freeze-extend">
          Request 5 More Minutes
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-freeze-close')?.addEventListener('click', () => {
    container.innerHTML = '';
  });

  container.querySelector('#btn-freeze-extend')?.addEventListener('click', () => {
    store.extendAppLimit(blockedApp.id, 5);
    container.innerHTML = '';
  });
}
