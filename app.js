const appShell = document.querySelector('.app-shell');
const guy = document.getElementById('guy');
const presence = document.getElementById('presence');
const activityLabel = document.getElementById('activityLabel');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const messages = document.getElementById('messages');
const thoughtBubble = document.getElementById('thoughtBubble');
const thoughtText = document.getElementById('thoughtText');
const toggleLog = document.getElementById('toggleLog');
const logPanel = document.getElementById('logPanel');

const taskStages = [
  { phase: 'planning', message: 'Drafting a compact plan', state: 'thinking' },
  { phase: 'researching', message: 'Researching relevant signals', state: 'thinking' },
  { phase: 'building', message: 'Building a clean first pass', state: 'working' },
  { phase: 'testing', message: 'Running checks and edge-case scan', state: 'working' },
  { phase: 'finishing', message: 'Polishing and packaging result', state: 'working' },
];

const idleThoughts = [
  'Want me to map out your next task?',
  'I can quietly prep a plan while you think.',
  'Need a concise summary or a deeper pass?',
  'I can start with research or jump straight to build.',
];

const ambientModes = [
  { mode: 'idle', status: 'idle · ambient listening', subtitle: 'calm and ready', state: 'idle' },
  { mode: 'idle', status: 'idle · scanning context', subtitle: 'quietly attentive', state: 'thinking' },
  { mode: 'rest', status: 'resting · low-power mode', subtitle: 'cozy and nearby', state: 'resting' },
];

let idleInterval;
let moodInterval;
let workingTimeout;

function setMode({ mode, status, subtitle, state }) {
  appShell.dataset.mode = mode;
  activityLabel.textContent = status;
  presence.textContent = subtitle;
  guy.dataset.state = state;
}

function setThought(text, autoHideMs = 0) {
  thoughtText.textContent = text;
  thoughtBubble.hidden = false;

  if (autoHideMs > 0) {
    window.clearTimeout(workingTimeout);
    workingTimeout = window.setTimeout(() => {
      thoughtBubble.hidden = true;
    }, autoHideMs);
  }
}

function addMessage(role, text) {
  const item = document.createElement('p');
  item.className = `msg ${role}`;
  item.textContent = text;
  messages.append(item);
  messages.scrollTop = messages.scrollHeight;
}

function cycleIdleThoughts() {
  idleInterval = window.setInterval(() => {
    if (appShell.dataset.mode !== 'idle') return;
    const thought = idleThoughts[Math.floor(Math.random() * idleThoughts.length)];
    setThought(thought);
  }, 6800);
}

function ambientMoodCycle() {
  let index = 0;
  moodInterval = window.setInterval(() => {
    if (appShell.dataset.mode === 'active' || appShell.dataset.mode === 'complete') return;
    setMode(ambientModes[index % ambientModes.length]);
    index += 1;
  }, 8800);
}

function runTask(task) {
  setMode({ mode: 'active', status: 'active · planning', subtitle: 'focused on your task', state: 'thinking' });
  setThought(`On it — "${task}"`, 2200);
  addMessage('user', task);
  addMessage('event', 'task accepted');

  taskStages.forEach((stage, idx) => {
    window.setTimeout(() => {
      setMode({ mode: 'active', status: `active · ${stage.phase}`, subtitle: 'in deep work mode', state: stage.state });
      addMessage('event', stage.message);
    }, 1100 * (idx + 1));
  });

  window.setTimeout(() => {
    setMode({ mode: 'complete', status: 'done · task completed', subtitle: 'ready for the next one', state: 'celebrate' });
    setThought('Done. Want a quick recap or deeper iteration?');
    addMessage('guy', `Finished: ${task}. I can summarize, refine, or continue from here.`);

    window.setTimeout(() => {
      setMode({ mode: 'idle', status: 'idle · ambient listening', subtitle: 'calm and ready', state: 'idle' });
    }, 1800);
  }, 1100 * (taskStages.length + 1));
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const task = taskInput.value.trim();
  if (!task) return;
  runTask(task);
  taskInput.value = '';
});

toggleLog.addEventListener('click', () => {
  const isHidden = logPanel.hasAttribute('hidden');
  if (isHidden) {
    logPanel.removeAttribute('hidden');
    toggleLog.textContent = 'close conversation';
    toggleLog.setAttribute('aria-expanded', 'true');
  } else {
    logPanel.setAttribute('hidden', '');
    toggleLog.textContent = 'conversation';
    toggleLog.setAttribute('aria-expanded', 'false');
  }
});

addMessage('guy', 'hi — i am guy. give me a small task and i will work through it.');
setThought(idleThoughts[0]);
cycleIdleThoughts();
ambientMoodCycle();

window.addEventListener('beforeunload', () => {
  window.clearInterval(idleInterval);
  window.clearInterval(moodInterval);
  window.clearTimeout(workingTimeout);
});
