import { Task, TaskStatus } from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const taskApi = {
  getAll: () => request<{ tasks: Task[] }>('/api/tasks'),

  create: (data: { name: string; type: 'A' | 'B'; tiktokUrl?: string; videoFileName?: string }) =>
    request<{ success: boolean; task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (data: {
    id: string;
    status?: TaskStatus;
    progress?: number;
    transcript?: string;
    rewrittenScript?: string;
    generatedVideoUrl?: string;
    projectId?: string;
  }) =>
    request<{ success: boolean; task: Task }>('/api/tasks/update', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
};
