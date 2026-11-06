import fs from 'fs';
import path from 'path';

interface Task {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  createdAt: string;
  tiktokUrl?: string;
  videoFileName?: string;
  transcript?: string;
  rewrittenScript?: string;
  generatedVideoUrl?: string;
  productInfo?: string;
  anchorStyle?: string;
  projectId?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTasks(): Task[] {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[TaskStore] Failed to load tasks:', e);
  }
  return getDefaultTasks();
}

let saveTimer: NodeJS.Timeout | null = null;
let pendingTasks: Task[] | null = null;

function saveTasks(tasks: Task[]) {
  pendingTasks = tasks;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    flushTasks();
  }, 800);
}

function flushTasks() {
  if (!pendingTasks) return;
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(pendingTasks, null, 2), 'utf-8');
    pendingTasks = null;
  } catch (e) {
    console.error('[TaskStore] Failed to save tasks:', e);
  }
}

process.on('exit', flushTasks);

function getDefaultTasks(): Task[] {
  return [];
}

let tasks: Task[] = loadTasks();

export const taskStore = {
  getAll: () => tasks,

  getById: (id: string) => tasks.find(t => t.id === id),

  create: (data: { name: string; type: string; tiktokUrl?: string; videoFileName?: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: 'pending',
      progress: 0,
      tiktokUrl: data.tiktokUrl || '',
      videoFileName: data.videoFileName || '',
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  },

  update: (id: string, data: Partial<Task>) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data };
    saveTasks(tasks);
    return tasks[index];
  },

  delete: (id: string) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    return true;
  },
};
