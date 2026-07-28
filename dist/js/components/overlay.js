/* ==========================================================================
   FocusOnFocus (FonF) - Freeze Overlay & Repeating Popup Fix
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

  // State check: Only show overlay if it wasn't dismissed/snoozed recently (within last 1 hour)
  const dismissedTime = (state.dismissedApps && state.dismissedApps[blockedApp.id]) || 0;
  const ONE_HOUR_MS = 60 * 60 * 1000;
  if (Date.now() - dismissedTime < ONE_HOUR_MS) {
    // Already snoozed/dismissed by user, do not show repeating popup
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="freeze-fullscreen">
      <div style="font-size: 4rem; margin-bottom: 16px;">${blockedApp.icon}</div>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; margin-bottom: 10px; color: #F8FAFC;">
        Daily Limit Reached
      </h2>
      <p style="font-size: 1rem; color: #CBD5E1; line-height: 1.5; margin-bottom: 32px; max-width: 320px;">
        You've reached your limit for <strong>${blockedApp.name}</strong> today 💜 Time to take a mindful break and stretch!
      </p>

      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
        <button class="btn-primary" id="btn-freeze-close" style="background: var(--accent-blue-metallic);">
          Dismiss & Return to Dashboard
        </button>
        <button class="btn-secondary" id="btn-freeze-extend" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">
          Request 5 More Minutes
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-freeze-close')?.addEventListener('click', () => {
    store.dismissAppLimitOverlay(blockedApp.id);
    container.innerHTML = '';
  });

  container.querySelector('#btn-freeze-extend')?.addEventListener('click', () => {
    store.extendAppLimit(blockedApp.id, 5);
    container.innerHTML = '';
  });
}
