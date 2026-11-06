import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Task, TaskStatus } from '../types';
import { taskApi } from '../services/api';

interface AppState {
  tasks: Task[];
  loadingTasks: boolean;
  activePlaybackTask: Task | null;
}

interface AppActions {
  fetchTasks: () => Promise<void>;
  createTask: (data: { name: string; type: 'A' | 'B'; tiktokUrl?: string; videoFileName?: string }) => Promise<Task | null>;
  updateTask: (data: { id: string; status?: TaskStatus; progress?: number; transcript?: string; rewrittenScript?: string; generatedVideoUrl?: string; projectId?: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setActivePlaybackTask: (task: Task | null) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activePlaybackTask, setActivePlaybackTask] = useState<Task | null>(null);
  const isFetching = useRef(false);

  const fetchTasks = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const data = await taskApi.getAll();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      isFetching.current = false;
      setLoadingTasks(false);
    }
  }, []);

  const createTask = useCallback(async (data: { name: string; type: 'A' | 'B'; tiktokUrl?: string; videoFileName?: string }) => {
    try {
      const result = await taskApi.create(data);
      if (result.success) {
        await fetchTasks();
        return result.task;
      }
    } catch (e) {
      console.error('Failed to create task:', e);
    }
    return null;
  }, [fetchTasks]);

  const updateTask = useCallback(async (data: { id: string; status?: TaskStatus; progress?: number; transcript?: string; rewrittenScript?: string; generatedVideoUrl?: string; projectId?: string }) => {
    try {
      await taskApi.update(data);
      await fetchTasks();
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskApi.delete(id);
      await fetchTasks();
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
    const timer = setInterval(fetchTasks, 5000);
    return () => clearInterval(timer);
  }, [fetchTasks]);

  return (
    <AppContext.Provider value={{
      tasks,
      loadingTasks,
      activePlaybackTask,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      setActivePlaybackTask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
