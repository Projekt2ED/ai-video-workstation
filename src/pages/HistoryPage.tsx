import React from 'react';
import { useApp } from '../contexts/AppContext';
import TaskHistory from '../components/TaskHistory';
import TaskDetailModal from '../components/TaskDetailModal';

export default function HistoryPage() {
  const { tasks, deleteTask, activePlaybackTask, setActivePlaybackTask } = useApp();

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">全部任务记录</h3>
        <p className="text-xs text-slate-400 font-mono">此处记录了所有 AI 视频处理任务的状态和结果，包括进行中和已完成的。</p>
      </div>
      <TaskHistory
        tasks={tasks}
        onDeleteTask={deleteTask}
        onSelectTask={setActivePlaybackTask}
      />
      {activePlaybackTask && (
        <TaskDetailModal task={activePlaybackTask} onClose={() => setActivePlaybackTask(null)} />
      )}
    </div>
  );
}
