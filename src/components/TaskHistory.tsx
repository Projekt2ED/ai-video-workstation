import React, { useState } from 'react';
import { Task } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import {
  Search,
  Clock,
  Trash2,
  Play,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface TaskHistoryProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export default function TaskHistory({ tasks, onDeleteTask, onSelectTask }: TaskHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "A" | "B">("all");
  const [copiedTask, setCopiedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.tiktokUrl && task.tiktokUrl.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyScript = (scriptText: string | undefined, id: string) => {
    if (!scriptText) return;
    try {
      const parsed = JSON.parse(scriptText);
      const textToCopy = parsed.translatedTranscript || 
                         parsed.scenes?.map((s: any) => `Scene ${s.sceneNumber}: ${s.voiceover}`).join('\n') || 
                         parsed.hook || 
                         '暂无脚本内容';
      navigator.clipboard.writeText(textToCopy);
      setCopiedTask(id);
      setTimeout(() => setCopiedTask(null), 1500);
    } catch {
      navigator.clipboard.writeText(scriptText);
      setCopiedTask(id);
      setTimeout(() => setCopiedTask(null), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-xl shadow-slate-950/15">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="搜索历史任务名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`text-[10px] font-mono px-3.5 py-2 rounded-xl border transition-colors ${
              filterType === 'all' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 font-bold' 
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600'
            }`}
          >
            全部 ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType("A")}
            className={`text-[10px] font-mono px-3.5 py-2 rounded-xl border transition-colors ${
              filterType === 'A' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 font-bold' 
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600'
            }`}
          >
            A·工作台 ({tasks.filter(t => t.type === 'A').length})
          </button>
          <button
            onClick={() => setFilterType("B")}
            className={`text-[10px] font-mono px-3.5 py-2 rounded-xl border transition-colors ${
              filterType === 'B' 
                ? 'bg-purple-600/10 text-purple-400 border-purple-500/30 font-bold' 
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600'
            }`}
          >
            B·数字人 ({tasks.filter(t => t.type === 'B').length})
          </button>
        </div>
      </div>

      {/* History Items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 border border-dashed border-slate-800 rounded-2xl min-h-[280px]">
            <Clock className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-xs text-slate-400">暂无任务记录</p>
            <p className="text-[9px] text-slate-600 font-mono mt-1">使用 A功能 或 B功能 创建新任务后即可在此查看</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            let infoText = "";
            if (task.type === 'A') {
              infoText = task.tiktokUrl || "TikTok Link Sources";
            } else {
              infoText = task.videoFileName || "Chinese Source Video";
            }

            return (
              <div 
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="group relative flex flex-col bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden p-5 hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      task.type === 'A' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {task.type === 'A' ? 'A·工作台' : 'B·数字人'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-700 shrink-0"
                    title="彻底删除历史"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body metadata */}
                <h4 className="text-xs font-bold text-white leading-snug tracking-tight mb-2 font-sans group-hover:text-blue-400 transition-colors">
                  {task.name}
                </h4>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${STATUS_COLORS[task.status] || STATUS_COLORS.pending}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                  {task.progress != null && (
                    <span className="text-[10px] font-mono text-slate-500">{task.progress}%</span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate mb-4 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-slate-500 font-bold block mb-0.5">关联详情:</span>
                  <p className="truncate text-slate-300 select-all" title={infoText}>{infoText}</p>
                </div>

                {/* Actions row footer */}
                <div className="mt-auto flex items-center gap-2.5 pt-3.5 border-t border-slate-700/50">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-semibold text-white py-2 px-3 rounded-xl transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    观看渲染视频
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyScript(task.rewrittenScript, task.id); }}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600/60 text-slate-300 hover:text-white transition-colors relative"
                    title="复制AI生成的英文台词"
                  >
                    {copiedTask === task.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
