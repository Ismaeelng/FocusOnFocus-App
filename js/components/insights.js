/* ==========================================================================
   FocusOnFocus (FonF) - App Usage Insights & App Categorization
   ========================================================================== */

import { store } from '../store.js';

export function renderInsightsView(container) {
  const state = store.getState();
  const sortedApps = [...state.apps].sort((a, b) => b.minutesUsed - a.minutesUsed);

  // Group minutes used by category
  const categories = { Social: 0, Entertainment: 0, Productive: 0, Other: 0 };
  sortedApps.forEach(app => {
    if (categories[app.category] !== undefined) {
      categories[app.category] += app.minutesUsed;
    } else {
      categories.Other += app.minutesUsed;
    }
  });

  const totalMinutes = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 class="greeting-title" style="font-size: 1.4rem;">Screen Time Insights</h2>
      <p class="sub-text" style="margin-bottom: 0;">Categorize apps & customize daily usage limits</p>
    </div>

    <div class="grid-dashboard-2col">
      <!-- Category Summary Chart -->
      <div class="card">
        <div class="section-title">Screen Time Breakdown</div>
        <div class="chart-container" style="margin-top: 20px;">
          <svg class="donut-svg" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--border-light)" stroke-width="5"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-social)" stroke-width="5"
                    stroke-dasharray="${(categories.Social / totalMinutes) * 100} ${100 - (categories.Social / totalMinutes) * 100}" stroke-dashoffset="25"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-entertainment)" stroke-width="5"
                    stroke-dasharray="${(categories.Entertainment / totalMinutes) * 100} ${100 - (categories.Entertainment / totalMinutes) * 100}" stroke-dashoffset="${25 - (categories.Social / totalMinutes) * 100}"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-productive)" stroke-width="5"
                    stroke-dasharray="${(categories.Productive / totalMinutes) * 100} ${100 - (categories.Productive / totalMinutes) * 100}" stroke-dashoffset="${25 - ((categories.Social + categories.Entertainment) / totalMinutes) * 100}"></circle>
          </svg>

          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background-color: var(--color-social);"></span>
              <span>Social: ${categories.Social}m (${Math.round((categories.Social / totalMinutes) * 100)}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background-color: var(--color-entertainment);"></span>
              <span>Entertainment: ${categories.Entertainment}m (${Math.round((categories.Entertainment / totalMinutes) * 100)}%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background-color: var(--color-productive);"></span>
              <span>Productive: ${categories.Productive}m (${Math.round((categories.Productive / totalMinutes) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- App Usage & Limits List -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">Monitored Apps</div>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Tap app to adjust limit & category</span>
        </div>

        <div class="app-list">
          ${sortedApps.map(app => {
            const pct = Math.min(100, Math.round((app.minutesUsed / app.dailyLimitMinutes) * 100));
            const isExceeded = app.minutesUsed >= app.dailyLimitMinutes;
            const isNear = pct >= 80 && !isExceeded;
            return `
              <div class="app-usage-item btn-open-app-detail" data-app-id="${app.id}">
                <div class="app-info-left">
                  <div class="app-icon-img">${app.icon}</div>
                  <div class="app-meta">
                    <div class="app-name-row">
                      <div>
                        <span class="app-name">${app.name}</span>
                        <span class="tag-badge" style="margin-left: 6px;">${app.category}</span>
                      </div>
                      <span class="app-time-text">${app.minutesUsed}m <span style="font-weight:400; color:var(--text-muted);">/ ${app.dailyLimitMinutes}m limit</span></span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill ${isExceeded ? 'limit-exceeded' : isNear ? 'near-limit' : ''}" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Modal Slot for App Detail -->
    <div id="app-detail-modal-container"></div>
  `;

  container.querySelectorAll('.btn-open-app-detail').forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app-id');
      renderAppDetailModal(appId, container.querySelector('#app-detail-modal-container'), () => {
        renderInsightsView(container);
      });
    });
  });
}

function renderAppDetailModal(appId, container, onClose) {
  const state = store.getState();
  const app = state.apps.find(a => a.id === appId);
  if (!app) return;

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const maxHistoryMinutes = Math.max(...app.history7Days, app.dailyLimitMinutes, 60);

  const modalHTML = `
    <div class="modal-backdrop">
      <div class="modal-sheet">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2.2rem;">${app.icon}</span>
            <div>
              <h3 class="section-title" style="margin-bottom: 2px;">${app.name}</h3>
              <span class="tag-badge">${app.category}</span>
            </div>
          </div>
          <button class="icon-btn" id="btn-close-app-modal" style="width: 34px; height: 34px;">✕</button>
        </div>

        <!-- 7-Day Usage Trend Graph -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px;">
            7-Day Usage Trend
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; background: var(--bg-main); padding: 14px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-light);">
            ${app.history7Days.map((val, idx) => {
              const barHeightPct = Math.round((val / maxHistoryMinutes) * 100);
              const isToday = idx === 6;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;">
                  <div style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">${val}m</div>
                  <div style="width: 16px; height: ${Math.max(8, barHeightPct)}%; background: ${isToday ? 'var(--accent-blue-primary)' : 'var(--accent-blue-light)'}; border-radius: 4px; transition: height 0.4s ease;"></div>
                  <div style="font-size: 0.7rem; font-weight: 600; color: ${isToday ? 'var(--accent-blue-primary)' : 'var(--text-secondary)'}">${daysLabels[idx]}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- App Category Selector -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">App Category</label>
          <select id="select-app-category" class="select-custom">
            <option value="Social" ${app.category === 'Social' ? 'selected' : ''}>Social (e.g. Instagram, TikTok, Twitter/X)</option>
            <option value="Entertainment" ${app.category === 'Entertainment' ? 'selected' : ''}>Entertainment (e.g. YouTube, Games)</option>
            <option value="Productive" ${app.category === 'Productive' ? 'selected' : ''}>Productive (e.g. Notion, Docs, Coding)</option>
            <option value="Other" ${app.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <!-- Daily Limit Slider -->
        <div class="card" style="background: var(--bg-main); border: 1px solid var(--border-light); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.9rem; font-weight: 700;">Set Daily Limit</span>
            <span id="limit-slider-val-display" style="font-size: 1rem; font-weight: 800; color: var(--accent-blue-primary);">${app.dailyLimitMinutes} minutes</span>
          </div>
          <input type="range" id="input-limit-slider" min="5" max="240" step="5" value="${app.dailyLimitMinutes}" style="width: 100%; accent-color: var(--accent-blue-primary); cursor: pointer;">
        </div>

        <button class="btn-primary" id="btn-save-app-settings" style="width: 100%;">Save App Settings</button>
      </div>
    </div>
  `;

  container.innerHTML = modalHTML;

  const closeFn = () => {
    container.innerHTML = '';
    onClose();
  };

  container.querySelector('#btn-close-app-modal')?.addEventListener('click', closeFn);
  container.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeFn();
  });

  const slider = container.querySelector('#input-limit-slider');
  const valDisplay = container.querySelector('#limit-slider-val-display');

  slider?.addEventListener('input', (e) => {
    valDisplay.textContent = `${e.target.value} minutes`;
  });

  container.querySelector('#btn-save-app-settings')?.addEventListener('click', () => {
    const newLimit = parseInt(slider.value, 10);
    const newCat = container.querySelector('#select-app-category').value;
    store.setAppLimit(appId, newLimit);
    store.updateAppCategory(appId, newCat);
    closeFn();
  });
}
