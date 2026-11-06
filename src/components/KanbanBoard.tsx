import React from 'react';
import { Task } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import {
  FileVideo,
  RefreshCw,
  Trash2,
  Chrome,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const columns: { key: string; label: string; border: string; bg: string; text: string }[] = [
  { key: 'pending', label: '待处理', border: 'border-slate-800', bg: 'bg-slate-900/50', text: 'text-slate-400' },
  { key: 'processing', label: '处理中', border: 'border-blue-900/45', bg: 'bg-indigo-950/20', text: 'text-blue-400' },
  { key: 'completed', label: '已完成', border: 'border-emerald-900/50', bg: 'bg-emerald-950/20', text: 'text-emerald-400' },
];

export default function KanbanBoard({ tasks, onSelectTask, onDeleteTask }: KanbanBoardProps) {
  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(col => {
        const colTasks = getTasksByStatus(col.key);
        return (
          <div key={col.key} className={`flex flex-col rounded-xl border ${col.border} ${col.bg} p-4 min-h-[300px]`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800/60 rounded-xl p-8">
                  <span className="text-xs text-slate-600">暂无任务</span>
                </div>
              ) : (
                colTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group relative flex flex-col bg-slate-800 rounded-xl border border-slate-700/60 p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-600/80 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                        task.type === 'A' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {task.type === 'A' ? 'A·工作台' : 'B·数字人'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                        className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-blue-400 transition-colors">
                      {task.name}
                    </h4>

                    <div className="flex flex-col gap-1.5 mb-3">
                      {task.type === 'A' && task.tiktokUrl && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono truncate">
                          <Chrome className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate" title={task.tiktokUrl}>{task.tiktokUrl}</span>
                        </div>
                      )}
                      {task.type === 'B' && task.videoFileName && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono truncate">
                          <FileVideo className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate" title={task.videoFileName}>{task.videoFileName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>进度</span>
                        <span className="text-slate-300 font-semibold">{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800/40">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            task.status === 'completed' ? 'bg-emerald-500' :
                            task.status === 'processing' ? 'bg-blue-500' : 'bg-slate-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {task.status === 'processing' && (
                      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mt-3 pt-2 border-t border-slate-700/40">
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                        <span>处理中...</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
