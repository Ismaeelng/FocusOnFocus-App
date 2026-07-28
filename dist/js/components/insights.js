/* ==========================================================================
   FocusOnFocus (FonF) - App Usage Insights & Limits Component
   ========================================================================== */

import { store } from '../store.js';

export function renderInsightsView(container) {
  const state = store.getState();

  // Sort apps descending by minutes used
  const sortedApps = [...state.apps].sort((a, b) => b.minutesUsed - a.minutesUsed);

  // Group minutes used by category
  const categories = { Social: 0, Games: 0, Productivity: 0, Other: 0 };
  sortedApps.forEach(app => {
    if (categories[app.category] !== undefined) {
      categories[app.category] += app.minutesUsed;
    } else {
      categories.Other += app.minutesUsed;
    }
  });

  const totalMinutes = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = `
    <!-- Insights Header -->
    <div style="margin-bottom: 16px;">
      <h2 class="greeting-title" style="font-size: 1.3rem;">Screen Time Insights</h2>
      <p class="sub-text" style="margin-bottom: 0;">Understand your habits & customize healthy limits</p>
    </div>

    <!-- Category Summary Donut / Bar Breakdown -->
    <div class="card">
      <div class="section-title">Usage by Category</div>
      <div class="chart-container">
        <!-- SVG Donut Chart -->
        <svg class="donut-svg" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--border-light)" stroke-width="5"></circle>
          <!-- Category Slices -->
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-coral)" stroke-width="5"
                  stroke-dasharray="${(categories.Social / totalMinutes) * 100} ${100 - (categories.Social / totalMinutes) * 100}" stroke-dashoffset="25"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-amber)" stroke-width="5"
                  stroke-dasharray="${(categories.Games / totalMinutes) * 100} ${100 - (categories.Games / totalMinutes) * 100}" stroke-dashoffset="${25 - (categories.Social / totalMinutes) * 100}"></circle>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-teal)" stroke-width="5"
                  stroke-dasharray="${(categories.Productivity / totalMinutes) * 100} ${100 - (categories.Productivity / totalMinutes) * 100}" stroke-dashoffset="${25 - ((categories.Social + categories.Games) / totalMinutes) * 100}"></circle>
        </svg>

        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background-color: var(--accent-coral);"></span>
            <span>Social: ${categories.Social}m (${Math.round((categories.Social / totalMinutes) * 100)}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background-color: var(--accent-amber);"></span>
            <span>Games: ${categories.Games}m (${Math.round((categories.Games / totalMinutes) * 100)}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background-color: var(--accent-teal);"></span>
            <span>Productivity: ${categories.Productivity}m (${Math.round((categories.Productivity / totalMinutes) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- App Usage & Limits List -->
    <div class="card">
      <div class="section-header">
        <div class="section-title">App Usage Today</div>
        <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Tap app to adjust limit</span>
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
                    <span class="app-name">${app.name}</span>
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

    <!-- Modal Slot for App Detail & 7-day Trend -->
    <div id="app-detail-modal-container"></div>
  `;

  // Attach event listeners
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 2rem;">${app.icon}</span>
            <div>
              <h3 class="section-title" style="margin-bottom: 0;">${app.name}</h3>
              <span class="tag-badge">${app.category}</span>
            </div>
          </div>
          <button class="icon-btn" id="btn-close-app-modal" style="width: 32px; height: 32px;">✕</button>
        </div>

        <!-- 7-Day Usage Trend Graph -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px;">
            7-Day Usage Trend
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; background: var(--bg-main); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-light);">
            ${app.history7Days.map((val, idx) => {
              const barHeightPct = Math.round((val / maxHistoryMinutes) * 100);
              const isToday = idx === 6;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;">
                  <div style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted);">${val}m</div>
                  <div style="width: 14px; height: ${Math.max(8, barHeightPct)}%; background: ${isToday ? 'var(--accent-teal)' : 'var(--accent-blue-light)'}; border-radius: 4px; transition: height 0.4s ease;"></div>
                  <div style="font-size: 0.68rem; font-weight: 600; color: ${isToday ? 'var(--accent-teal)' : 'var(--text-secondary)'}">${daysLabels[idx]}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Adjust Daily Limit Slider -->
        <div class="card" style="background: var(--bg-main); border: 1px solid var(--border-light); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.9rem; font-weight: 700;">Set Daily Limit</span>
            <span id="limit-slider-val-display" style="font-size: 1rem; font-weight: 800; color: var(--accent-teal);">${app.dailyLimitMinutes} minutes</span>
          </div>
          <input type="range" id="input-limit-slider" min="5" max="240" step="5" value="${app.dailyLimitMinutes}" style="width: 100%; accent-color: var(--accent-teal); cursor: pointer;">
          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
            <span>5m</span>
            <span>60m (1h)</span>
            <span>120m (2h)</span>
            <span>240m (4h)</span>
          </div>
        </div>

        <button class="btn-primary" id="btn-save-limit" style="width: 100%;">Save Daily Limit</button>
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

  container.querySelector('#btn-save-limit')?.addEventListener('click', () => {
    const newLimit = parseInt(slider.value, 10);
    store.setAppLimit(appId, newLimit);
    closeFn();
  });
}
