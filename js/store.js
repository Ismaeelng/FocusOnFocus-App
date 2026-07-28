/* ==========================================================================
   FocusOnFocus (FonF) - Data Store & LocalStorage Persistence
   ========================================================================== */

const STORAGE_KEY = 'fonf_app_data_v2';

const initialData = {
  theme: 'light',
  streakDays: 3,
  lastStreakDate: new Date().toISOString().split('T')[0],
  
  permissions: {
    usageAccess: true,
    accessibility: true,
    hasOnboarded: true
  },
  
  settings: {
    globalFreezeEnabled: true,
    scheduleEnabled: true,
    scheduleStart: "09:00",
    scheduleEnd: "17:00",
    notificationsEnabled: true,
    soundEffects: true
  },

  dismissedApps: {}, // appId -> timestamp dismissed

  apps: [
    {
      id: 'app_instagram',
      packageName: 'com.instagram.android',
      name: 'Instagram',
      icon: '📸',
      category: 'Social',
      minutesUsed: 42,
      dailyLimitMinutes: 30, // Exceeded!
      history7Days: [25, 45, 30, 50, 20, 35, 42]
    },
    {
      id: 'app_tiktok',
      packageName: 'com.zhiliaoapp.musically',
      name: 'TikTok',
      icon: '🎵',
      category: 'Social',
      minutesUsed: 28,
      dailyLimitMinutes: 35,
      history7Days: [40, 50, 30, 20, 45, 60, 28]
    },
    {
      id: 'app_youtube',
      packageName: 'com.google.android.youtube',
      name: 'YouTube',
      icon: '▶️',
      category: 'Entertainment',
      minutesUsed: 25,
      dailyLimitMinutes: 45,
      history7Days: [30, 20, 15, 40, 25, 30, 25]
    },
    {
      id: 'app_pubg',
      packageName: 'com.tencent.ig',
      name: 'PUBG Mobile',
      icon: '🎮',
      category: 'Entertainment',
      minutesUsed: 20,
      dailyLimitMinutes: 30,
      history7Days: [0, 45, 60, 15, 0, 30, 20]
    },
    {
      id: 'app_notion',
      packageName: 'com.notion.id',
      name: 'Notion & Docs',
      icon: '📝',
      category: 'Productive',
      minutesUsed: 35,
      dailyLimitMinutes: 120,
      history7Days: [30, 40, 60, 50, 45, 65, 35]
    }
  ],

  tasks: [
    {
      id: 'task_1',
      title: 'Review Machine Learning Chapter 4',
      description: 'Focus on neural networks loss functions and gradient descent equations.',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '14:30',
      priority: 'high',
      category: 'Study',
      completed: false,
      recurring: 'none'
    },
    {
      id: 'task_2',
      title: 'Submit Weekly Team Progress Report',
      description: 'Outline completed milestones and list blockers for next sprint.',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '17:00',
      priority: 'medium',
      category: 'Work',
      completed: false,
      recurring: 'weekly'
    },
    {
      id: 'task_3',
      title: '30-Minute Evening Walk & Meditation',
      description: 'Unwind and leave phone in pocket.',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '19:00',
      priority: 'low',
      category: 'Personal',
      completed: true,
      recurring: 'daily'
    }
  ],

  activeFocusSession: null
};

class AppStore {
  constructor() {
    this.listeners = new Set();
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read LocalStorage", e);
    }
    return JSON.parse(JSON.stringify(initialData));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error("Could not write to LocalStorage", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  getState() {
    return this.data;
  }

  setTheme(theme) {
    this.data.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.save();
  }

  toggleTheme() {
    const nextTheme = this.data.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  // Task Actions
  addTask(task) {
    const newTask = {
      id: 'task_' + Date.now(),
      completed: false,
      ...task
    };
    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  toggleTaskComplete(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.save();
    }
  }

  deleteTask(taskId) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
    this.save();
  }

  // App Usage & Limit Actions
  setAppLimit(appId, limitMinutes) {
    const app = this.data.apps.find(a => a.id === appId);
    if (app) {
      app.dailyLimitMinutes = limitMinutes;
      // Reset dismiss state when limit changes
      delete this.data.dismissedApps[appId];
      this.save();
    }
  }

  extendAppLimit(appId, extraMinutes = 5) {
    const app = this.data.apps.find(a => a.id === appId);
    if (app) {
      app.dailyLimitMinutes += extraMinutes;
      delete this.data.dismissedApps[appId];
      this.save();
    }
  }

  dismissAppLimitOverlay(appId) {
    if (!this.data.dismissedApps) this.data.dismissedApps = {};
    this.data.dismissedApps[appId] = Date.now();
    this.save();
  }

  updateAppCategory(appId, category) {
    const app = this.data.apps.find(a => a.id === appId);
    if (app) {
      app.category = category;
      this.save();
    }
  }

  // Permissions & Settings
  grantPermissions() {
    this.data.permissions.usageAccess = true;
    this.data.permissions.accessibility = true;
    this.data.permissions.hasOnboarded = true;
    this.save();
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }

  // Focus Session
  startFocusSession(taskTitle, durationMinutes = 25, ambientSound = 'rain') {
    this.data.activeFocusSession = {
      taskId: taskTitle,
      durationMinutes: durationMinutes,
      timeRemainingSeconds: durationMinutes * 60,
      ambientSound: ambientSound,
      isRunning: true,
      startedAt: Date.now()
    };
    this.save();
  }

  updateFocusSession(remainingSeconds) {
    if (this.data.activeFocusSession) {
      this.data.activeFocusSession.timeRemainingSeconds = remainingSeconds;
      this.save();
    }
  }

  endFocusSession(completedSuccessfully = true) {
    if (completedSuccessfully) {
      this.data.streakDays += 1;
    }
    this.data.activeFocusSession = null;
    this.save();
  }
}

export const store = new AppStore();
