/* ==========================================================================
   FocusOnFocus (FonF) - Friendly Permission Onboarding Drawer Component
   ========================================================================== */

import { store } from '../store.js';

export function renderPermissionOnboarding(container, onComplete) {
  const state = store.getState();
  if (state.permissions.hasOnboarded) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-sheet" style="border-radius: 28px 28px 0 0; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🌱</div>
        <h2 class="greeting-title" style="font-size: 1.4rem;">Welcome to FocusOnFocus!</h2>
        <p class="sub-text" style="margin-bottom: 20px;">
          To help you gently manage screen time and block distractions, FocusOnFocus requires two standard Android permissions:
        </p>

        <div style="text-align: left; display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
          <div style="display: flex; gap: 12px; align-items: flex-start; background: var(--bg-main); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-light);">
            <span style="font-size: 1.5rem;">📊</span>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">Usage Access Permission</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                Allows the app to display daily screen time and chart your 7-day app usage trends.
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 12px; align-items: flex-start; background: var(--bg-main); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-light);">
            <span style="font-size: 1.5rem;">🛡️</span>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">Accessibility Service Permission</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                Enables the gentle full-screen freeze overlay when your chosen app limit is reached or during Focus Mode.
              </div>
            </div>
          </div>
        </div>

        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 16px;">
          🔒 Your data stays 100% private on your device and is never shared or stored remotely.
        </div>

        <button class="btn-primary" id="btn-grant-permissions" style="width: 100%;">
          Enable Permissions & Get Started
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-grant-permissions')?.addEventListener('click', () => {
    store.grantPermissions();
    container.innerHTML = '';
    onComplete();
  });
}
