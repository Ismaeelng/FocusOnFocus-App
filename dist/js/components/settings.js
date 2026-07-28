/* ==========================================================================
   FocusOnFocus (FonF) - Settings View Component
   ========================================================================== */

import { store } from '../store.js';

export function renderSettingsView(container) {
  const state = store.getState();

  container.innerHTML = `
    <!-- Settings Header -->
    <div style="margin-bottom: 16px;">
      <h2 class="greeting-title" style="font-size: 1.3rem;">Settings & Preferences</h2>
      <p class="sub-text" style="margin-bottom: 0;">Customize your coach experience & app freezing rules</p>
    </div>

    <!-- Global Freezing Controls -->
    <div class="card">
      <div class="section-title" style="margin-bottom: 12px;">App Freezing Rules</div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">Global App Freezing</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">Automatically lock apps when daily limits are reached</div>
        </div>
        <input type="checkbox" id="setting-toggle-freeze" ${state.settings.globalFreezeEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-teal); cursor: pointer;">
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">Scheduled Focus Mode</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">Block limited apps during core work hours</div>
        </div>
        <input type="checkbox" id="setting-toggle-schedule" ${state.settings.scheduleEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-teal); cursor: pointer;">
      </div>

      <div style="display: flex; gap: 10px; margin-top: 14px;">
        <div class="form-group" style="flex: 1; margin-bottom: 0;">
          <label class="form-label">Schedule Start</label>
          <input type="time" id="setting-schedule-start" class="input-text" value="${state.settings.scheduleStart}">
        </div>
        <div class="form-group" style="flex: 1; margin-bottom: 0;">
          <label class="form-label">Schedule End</label>
          <input type="time" id="setting-schedule-end" class="input-text" value="${state.settings.scheduleEnd}">
        </div>
      </div>
    </div>

    <!-- Notification Preferences -->
    <div class="card">
      <div class="section-title" style="margin-bottom: 12px;">Notifications & Audio</div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">Task & Limit Reminders</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">Encouraging nudges when approaching app limits</div>
        </div>
        <input type="checkbox" id="setting-toggle-notifications" ${state.settings.notificationsEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-teal); cursor: pointer;">
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">Sound Effects & Synthesizer</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">Audio feedback for focus timer & ambient noise</div>
        </div>
        <input type="checkbox" id="setting-toggle-sound" ${state.settings.soundEffects ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-teal); cursor: pointer;">
      </div>
    </div>

    <!-- Theme & Display -->
    <div class="card">
      <div class="section-title" style="margin-bottom: 12px;">Appearance</div>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">Dark Theme</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">Soft dark pastels for eye comfort</div>
        </div>
        <button class="btn-secondary" id="btn-toggle-theme-setting" style="padding: 8px 16px; font-size: 0.85rem;">
          ${state.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelector('#setting-toggle-freeze')?.addEventListener('change', (e) => {
    store.updateSettings({ globalFreezeEnabled: e.target.checked });
  });

  container.querySelector('#setting-toggle-schedule')?.addEventListener('change', (e) => {
    store.updateSettings({ scheduleEnabled: e.target.checked });
  });

  container.querySelector('#setting-schedule-start')?.addEventListener('change', (e) => {
    store.updateSettings({ scheduleStart: e.target.value });
  });

  container.querySelector('#setting-schedule-end')?.addEventListener('change', (e) => {
    store.updateSettings({ scheduleEnd: e.target.value });
  });

  container.querySelector('#setting-toggle-notifications')?.addEventListener('change', (e) => {
    store.updateSettings({ notificationsEnabled: e.target.checked });
  });

  container.querySelector('#setting-toggle-sound')?.addEventListener('change', (e) => {
    store.updateSettings({ soundEffects: e.target.checked });
  });

  container.querySelector('#btn-toggle-theme-setting')?.addEventListener('click', () => {
    store.toggleTheme();
    renderSettingsView(container);
  });
}
