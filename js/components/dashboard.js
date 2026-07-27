/* ==========================================================================
   FocusOnFocus (FonF) - Home Dashboard View Component
   ========================================================================== */

import { store } from '../store.js';
import { triggerConfetti } from './confetti.js';

export function renderHomeDashboard(container, onNavigateTab, onStartFocus) {
  const state = store.getState();
  
  // Calculate total screen time today across apps
  const totalMinutes = state.apps.reduce((sum, app) => sum + app.minutesUsed, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const formattedHours = Math.floor(totalMinutes / 60);
  const formattedMins = totalMinutes % 60;
  const timeDisplayStr = `${formattedHours}h ${formattedMins}m`;

  // Calculate daily screen time target goal (e.g. 3h 00m = 180 mins)
  const dailyGoalMinutes = 180;
  const progressPercent = Math.min(100, Math.round((totalMinutes / dailyGoalMinutes) * 100));
  
  // SVG Circle stroke-dashoffset math (circumference = 2 * PI * r = 2 * 3.14159 * 70 = ~440)
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Dynamic time-of-day greeting
  const currentHour = new Date().getHours();
  let greetingText = "Good morning! Let's have a focused day 🌱";
  if (currentHour >= 12 && currentHour < 17) {
    greetingText = "Good afternoon! Keep up the great momentum ☀️";
  } else if (currentHour >= 17) {
    greetingText = "Good evening! Time to reflect & wind down 🌙";
  }

  // Filter today's tasks (limit to top 3)
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks
    .filter(t => t.dueDate === todayDate)
    .slice(0, 3);

  container.innerHTML = `
    <!-- Warm Greeting -->
    <div class="card greeting-card" style="background: linear-gradient(135deg, var(--bg-card) 0%, var(--accent-blue-light) 100%);">
      <h1 class="greeting-title">${greetingText}</h1>
      <p class="sub-text">You're doing great. Small steady steps lead to big focus achievements!</p>
      
      <div class="limit-goal-tag">
        <span class="goal-status-dot" style="background-color: ${progressPercent > 90 ? 'var(--accent-amber)' : 'var(--accent-teal)'}"></span>
        <span>${progressPercent <= 100 ? `${100 - progressPercent}% within daily budget` : 'Budget limit reached'}</span>
      </div>
    </div>

    <!-- Screen Time Progress Ring -->
    <div class="card screentime-card">
      <div class="section-title" style="margin-bottom: 2px;">Today's Screen Time</div>
      <div class="sub-text" style="margin-bottom: 0;">Goal: Under 3h 00m</div>

      <div class="ring-container">
        <svg class="ring-svg" viewBox="0 0 160 160">
          <circle class="ring-bg" cx="80" cy="80" r="${circleRadius}"></circle>
          <circle class="ring-progress ${progressPercent > 85 ? 'warning' : ''}" 
                  cx="80" cy="80" r="${circleRadius}" 
                  style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"></circle>
        </svg>
        <div class="ring-center-content">
          <div class="time-val">${timeDisplayStr}</div>
          <div class="time-label">Total Time</div>
        </div>
      </div>

      <!-- Limited Apps Quick Progress Indicators -->
      <div style="width: 100%; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">
          <span>Limited Apps Watch</span>
          <span>${state.apps.filter(a => a.minutesUsed >= a.dailyLimitMinutes).length} / ${state.apps.length} at limit</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${state.apps.slice(0, 3).map(app => {
            const pct = Math.min(100, Math.round((app.minutesUsed / app.dailyLimitMinutes) * 100));
            const isExceeded = app.minutesUsed >= app.dailyLimitMinutes;
            const isNear = pct >= 80 && !isExceeded;
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">
                  <span>${app.icon} ${app.name}</span>
                  <span style="color: ${isExceeded ? 'var(--accent-coral)' : isNear ? 'var(--accent-amber)' : 'var(--text-secondary)'}">
                    ${app.minutesUsed}m / ${app.dailyLimitMinutes}m
                  </span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill ${isExceeded ? 'limit-exceeded' : isNear ? 'near-limit' : ''}" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Compact Today's Tasks Card -->
    <div class="card">
      <div class="section-header">
        <div class="section-title">Today's Tasks (${todayTasks.filter(t => t.completed).length}/${todayTasks.length})</div>
        <button class="link-btn" id="btn-view-all-tasks">
          View all 
          <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      ${todayTasks.length === 0 ? `
        <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.88rem;">
          🎉 All caught up for today! Add a task to stay ahead.
        </div>
      ` : `
        <div class="task-list-mini">
          ${todayTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
              <div class="task-left">
                <div class="checkbox-custom btn-toggle-task" data-task-id="${task.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="task-details">
                  <div class="task-title">${task.title}</div>
                  <div class="task-meta">
                    <span class="priority-dot priority-${task.priority}"></span>
                    <span>${task.dueTime || 'Today'}</span>
                    <span class="tag-badge">${task.category}</span>
                  </div>
                </div>
              </div>
              ${!task.completed ? `
                <button class="focus-btn-sm btn-start-task-focus" data-task-title="${task.title}">
                  <span>⚡ Focus</span>
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Attach Event Handlers
  container.querySelector('#btn-view-all-tasks')?.addEventListener('click', () => {
    onNavigateTab('tasks');
  });

  container.querySelectorAll('.btn-toggle-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      store.toggleTaskComplete(taskId);
      triggerConfetti();
      renderHomeDashboard(container, onNavigateTab, onStartFocus);
    });
  });

  container.querySelectorAll('.btn-start-task-focus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = btn.getAttribute('data-task-title');
      onStartFocus(title);
    });
  });
}
