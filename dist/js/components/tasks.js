/* ==========================================================================
   FocusOnFocus (FonF) - Task Management View Component & FAB
   ========================================================================== */

import { store } from '../store.js';
import { triggerConfetti } from './confetti.js';

export function renderTasksView(container, onStartFocus) {
  const state = store.getState();
  const todayDate = new Date().toISOString().split('T')[0];

  const todayTasks = state.tasks.filter(t => t.dueDate === todayDate && !t.completed);
  const upcomingTasks = state.tasks.filter(t => t.dueDate > todayDate && !t.completed);
  const completedTasks = state.tasks.filter(t => t.completed);

  container.innerHTML = `
    <!-- Top Action Row -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2 class="greeting-title" style="font-size: 1.4rem;">Tasks & Goals</h2>
        <p class="sub-text" style="margin-bottom: 0;">Organize your custom goals and link them to focus sessions</p>
      </div>
      <button class="btn-primary" id="btn-open-create-task" style="display: flex; align-items: center; gap: 6px;">
        <svg style="width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Task
      </button>
    </div>

    <!-- Section: Today -->
    <details open class="card">
      <summary style="font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; cursor: pointer; color: var(--text-primary); margin-bottom: 12px; user-select: none;">
        Today (${todayTasks.length})
      </summary>
      ${todayTasks.length === 0 ? `
        <div style="font-size: 0.88rem; color: var(--text-muted); padding: 12px 0;">No pending tasks for today. Click "+ Add Task" to schedule your next goal! 🌟</div>
      ` : `
        <div class="task-list">
          ${todayTasks.map(task => renderTaskCard(task)).join('')}
        </div>
      `}
    </details>

    <!-- Section: Upcoming -->
    <details open class="card">
      <summary style="font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; cursor: pointer; color: var(--text-primary); margin-bottom: 12px; user-select: none;">
        Upcoming (${upcomingTasks.length})
      </summary>
      ${upcomingTasks.length === 0 ? `
        <div style="font-size: 0.88rem; color: var(--text-muted); padding: 12px 0;">No upcoming tasks scheduled yet.</div>
      ` : `
        <div class="task-list">
          ${upcomingTasks.map(task => renderTaskCard(task)).join('')}
        </div>
      `}
    </details>

    <!-- Section: Completed -->
    <details class="card">
      <summary style="font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; cursor: pointer; color: var(--text-secondary); margin-bottom: 12px; user-select: none;">
        Completed (${completedTasks.length})
      </summary>
      ${completedTasks.length === 0 ? `
        <div style="font-size: 0.88rem; color: var(--text-muted); padding: 12px 0;">No completed tasks yet today.</div>
      ` : `
        <div class="task-list">
          ${completedTasks.map(task => renderTaskCard(task)).join('')}
        </div>
      `}
    </details>

    <!-- Floating Action Button (FAB) -->
    <button class="fab-add-task" id="fab-add-task">
      <svg style="width:20px; height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      <span>New Task</span>
    </button>

    <!-- Create Task Modal Slot -->
    <div id="create-task-modal-container"></div>
  `;

  // Attach event handlers
  container.querySelectorAll('.btn-toggle-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      store.toggleTaskComplete(taskId);
      triggerConfetti();
      renderTasksView(container, onStartFocus);
    });
  });

  container.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      store.deleteTask(taskId);
      renderTasksView(container, onStartFocus);
    });
  });

  container.querySelectorAll('.btn-start-focus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = btn.getAttribute('data-task-title');
      onStartFocus(title);
    });
  });

  const openModalFn = () => {
    renderCreateTaskModal(container.querySelector('#create-task-modal-container'), () => {
      renderTasksView(container, onStartFocus);
    });
  };

  container.querySelector('#btn-open-create-task')?.addEventListener('click', openModalFn);
  container.querySelector('#fab-add-task')?.addEventListener('click', openModalFn);
}

function renderTaskCard(task) {
  return `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
      <div class="task-left">
        <div class="checkbox-custom btn-toggle-task" data-task-id="${task.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="task-details">
          <div class="task-title">${task.title}</div>
          ${task.description ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${task.description}</div>` : ''}
          <div class="task-meta" style="margin-top: 4px;">
            <span class="priority-dot priority-${task.priority}"></span>
            <span style="text-transform: capitalize;">${task.priority} Priority</span>
            <span>• ${task.dueDate} ${task.dueTime ? `@ ${task.dueTime}` : ''}</span>
            <span class="tag-badge">${task.category}</span>
            ${task.recurring !== 'none' ? `<span class="tag-badge" style="background: var(--accent-blue-light); color: var(--accent-blue-primary);">🔁 ${task.recurring}</span>` : ''}
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${!task.completed ? `
          <button class="focus-btn-sm btn-start-focus" data-task-title="${task.title}" title="Start Focus Session">
            <span>⚡ Focus</span>
          </button>
        ` : ''}
        <button class="icon-btn btn-delete-task" data-task-id="${task.id}" style="width: 34px; height: 34px;" title="Delete Task">
          <svg style="width: 14px; height: 14px; color: var(--accent-coral);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `;
}

function renderCreateTaskModal(container, onClose) {
  const modalHTML = `
    <div class="modal-backdrop">
      <div class="modal-sheet">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 class="section-title">Create Custom Task</h3>
          <button class="icon-btn" id="btn-close-modal" style="width: 34px; height: 34px;">✕</button>
        </div>
        <form id="form-create-task">
          <div class="form-group">
            <label class="form-label">Task Title *</label>
            <input type="text" id="task-input-title" class="input-text" placeholder="e.g. Finish Architecture Slides" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description (Optional)</label>
            <input type="text" id="task-input-desc" class="input-text" placeholder="Add custom notes or instructions...">
          </div>
          <div style="display: flex; gap: 12px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Due Date</label>
              <input type="date" id="task-input-date" class="input-text" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Due Time</label>
              <input type="time" id="task-input-time" class="input-text" value="14:00">
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Priority</label>
              <select id="task-input-priority" class="select-custom">
                <option value="low">Low Priority (Green)</option>
                <option value="medium" selected>Medium Priority (Amber)</option>
                <option value="high">High Priority (Coral)</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Category</label>
              <select id="task-input-category" class="select-custom">
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Recurring Schedule</label>
            <select id="task-input-recurring" class="select-custom">
              <option value="none">One-time Task</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; margin-top: 12px;">Save & Create Task</button>
        </form>
      </div>
    </div>
  `;

  container.innerHTML = modalHTML;

  const closeFn = () => {
    container.innerHTML = '';
    onClose();
  };

  container.querySelector('#btn-close-modal')?.addEventListener('click', closeFn);
  container.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeFn();
  });

  container.querySelector('#form-create-task')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = container.querySelector('#task-input-title').value.trim();
    const desc = container.querySelector('#task-input-desc').value.trim();
    const dueDate = container.querySelector('#task-input-date').value;
    const dueTime = container.querySelector('#task-input-time').value;
    const priority = container.querySelector('#task-input-priority').value;
    const category = container.querySelector('#task-input-category').value;
    const recurring = container.querySelector('#task-input-recurring').value;

    if (title) {
      store.addTask({
        title,
        description: desc,
        dueDate,
        dueTime,
        priority,
        category,
        recurring
      });
      closeFn();
    }
  });
}
