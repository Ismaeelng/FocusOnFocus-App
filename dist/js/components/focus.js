/* ==========================================================================
   FocusOnFocus (FonF) - Focus Mode Timer Component & Ambient Synthesizer
   ========================================================================== */

import { store } from '../store.js';
import { triggerConfetti } from './confetti.js';

let timerInterval = null;
let audioCtx = null;
let ambientOscillator = null;

export function renderFocusView(container, linkedTaskTitle = null, onFinishSession) {
  const state = store.getState();
  const session = state.activeFocusSession || {
    taskId: linkedTaskTitle || 'General Deep Focus',
    durationMinutes: 25,
    timeRemainingSeconds: 25 * 60,
    ambientSound: 'rain',
    isRunning: false
  };

  const minutes = Math.floor(session.timeRemainingSeconds / 60);
  const seconds = session.timeRemainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSecs = session.durationMinutes * 60;
  const progressPct = ((totalSecs - session.timeRemainingSeconds) / totalSecs) * 100;
  
  const circleRadius = 90;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  container.innerHTML = `
    <div class="focus-container">
      <div class="focus-task-tag">
        <span>🎯 Active Task: <strong>${session.taskId}</strong></span>
      </div>

      <!-- Minimalist Timer Ring -->
      <div class="timer-circle">
        <svg viewBox="0 0 220 220" style="width:100%; height:100%;">
          <circle cx="110" cy="110" r="${circleRadius}" fill="none" stroke="var(--border-light)" stroke-width="12"></circle>
          <circle cx="110" cy="110" r="${circleRadius}" fill="none" stroke="var(--accent-purple)" stroke-width="12"
                  stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
                  style="transition: stroke-dashoffset 1s linear;"></circle>
        </svg>
        <div class="ring-center-content">
          <div class="timer-val-big">${timeStr}</div>
          <div class="time-label" style="color: var(--accent-purple); font-weight:700;">${session.isRunning ? 'FOCUSING' : 'READY'}</div>
        </div>
      </div>

      <!-- Ambient Sound Chips -->
      <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
        AMBIENT SOUND BACKGROUND
      </div>
      <div class="ambient-selector">
        <button class="ambient-chip ${session.ambientSound === 'rain' ? 'active' : ''}" data-sound="rain">🌧️ Rain</button>
        <button class="ambient-chip ${session.ambientSound === 'forest' ? 'active' : ''}" data-sound="forest">🌲 Forest</button>
        <button class="ambient-chip ${session.ambientSound === 'waves' ? 'active' : ''}" data-sound="waves">🌊 Waves</button>
        <button class="ambient-chip ${session.ambientSound === 'off' ? 'active' : ''}" data-sound="off">🔇 Off</button>
      </div>

      <!-- Timer Control Actions -->
      <div class="timer-actions">
        ${!session.isRunning ? `
          <button class="btn-primary" id="btn-toggle-timer" style="background: var(--accent-purple);">
            Start Focus Session
          </button>
        ` : `
          <button class="btn-secondary" id="btn-toggle-timer">
            Pause
          </button>
          <button class="btn-primary" id="btn-finish-timer" style="background: var(--accent-teal);">
            Complete Session
          </button>
        `}
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.ambient-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const snd = btn.getAttribute('data-sound');
      session.ambientSound = snd;
      playAmbientSound(snd);
      renderFocusView(container, linkedTaskTitle, onFinishSession);
    });
  });

  container.querySelector('#btn-toggle-timer')?.addEventListener('click', () => {
    if (!session.isRunning) {
      session.isRunning = true;
      store.startFocusSession(session.taskId, session.durationMinutes, session.ambientSound);
      playAmbientSound(session.ambientSound);
      startCountdown(container, session, onFinishSession);
    } else {
      session.isRunning = false;
      clearInterval(timerInterval);
      stopAmbientSound();
      renderFocusView(container, linkedTaskTitle, onFinishSession);
    }
  });

  container.querySelector('#btn-finish-timer')?.addEventListener('click', () => {
    clearInterval(timerInterval);
    stopAmbientSound();
    store.endFocusSession(true);
    triggerConfetti();
    onFinishSession();
  });
}

function startCountdown(container, session, onFinishSession) {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (session.timeRemainingSeconds > 0) {
      session.timeRemainingSeconds -= 1;
      store.updateFocusSession(session.timeRemainingSeconds);
      renderFocusView(container, session.taskId, onFinishSession);
    } else {
      clearInterval(timerInterval);
      stopAmbientSound();
      store.endFocusSession(true);
      triggerConfetti();
      onFinishSession();
    }
  }, 1000);
}

// Web Audio API Synthesizer for Ambient Sounds (Rain / Forest / Waves)
function playAmbientSound(type) {
  stopAmbientSound();
  if (type === 'off') return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create White Noise buffer for Rain/Waves
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter node
    const filter = audioCtx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 800;
    } else if (type === 'forest') {
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.value = 400;
    }

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.08; // Soft volume

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    whiteNoise.start();

    ambientOscillator = whiteNoise;
  } catch (e) {
    console.warn("Web Audio API initialization skipped", e);
  }
}

function stopAmbientSound() {
  if (ambientOscillator) {
    try { ambientOscillator.stop(); } catch(e){}
    ambientOscillator = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch(e){}
    audioCtx = null;
  }
}
