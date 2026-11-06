import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/Toast';
import KanbanBoard from '../components/KanbanBoard';
import TaskDetailModal from '../components/TaskDetailModal';
import {
  Sparkles,
  Languages,
  Plus,
  RefreshCw,
  Globe,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, loadingTasks, createTask, deleteTask, activePlaybackTask, setActivePlaybackTask } = useApp();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'A' | 'B'>('A');
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState('');

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task = await createTask({
      name: newTitle,
      type: newType,
      tiktokUrl: newType === 'A' ? newUrl : undefined,
      videoFileName: newType === 'B' ? newFile : undefined,
    });

    if (task) {
      toast(`任务"${newTitle}"已创建`, 'success');
      if (newType === 'A' && newUrl) navigate('/a');
    } else {
      toast('任务创建失败', 'error');
    }

    setNewTitle('');
    setNewUrl('');
    setNewFile('');
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="bg-slate-900 border border-[#334155] p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-lg font-bold text-[#3B82F6] flex items-center gap-1.5 justify-center md:justify-start">
            <Globe className="w-5 h-5 text-blue-400 animate-pulse" />
            欢迎使用出海智能视频工作台
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            您可以导入 TikTok 竞争同行链接，一键克隆脚本并添加机器实拍，或上传口播视频自动分离英语发音（口型完美克隆）。
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>实时任务看板同步中</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-[#334155] p-6 rounded-2xl space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              极速发起新视频制作线
            </h3>
            <p className="text-xs text-slate-400 mt-1">请任选一种契合工厂素材情况的业务模式，AI 将一键调动大模型极速处理</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-white" />
            手动发布空任务
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            onClick={() => navigate('/a')}
            className="group relative overflow-hidden bg-slate-950 border border-slate-800 hover:border-blue-500/80 p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.015] hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-blue-500/15 text-blue-400 font-bold border border-blue-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-tight">推荐</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-4 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
              业务 A: 智能视频工作台
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              输入视频链接，AI 自动下载→ASR识别→LLM仿写脚本→素材上传→视频生成→成品输出。全流程一站式完成。
            </p>
          </div>

          <div
            onClick={() => navigate('/b')}
            className="group relative overflow-hidden bg-slate-950 border border-slate-800 hover:border-purple-500/80 p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.015] hover:shadow-xl hover:shadow-purple-500/5"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Languages className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-purple-500/15 text-purple-400 font-bold border border-purple-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-tight">热选</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-4 flex items-center gap-1 group-hover:text-purple-400 transition-colors">
              业务 B: 数字人视频处理
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              上传中文口播视频 → AI换口型+声音克隆+花字字幕 → 输出处理好的英文视频。简单快捷。
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-bold text-white tracking-tight">出海交付任务看板</h3>
        <div className="text-xs text-slate-400 font-sans flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          <span>共 <b className="text-blue-400">{tasks.length}</b> 个运行流</span>
        </div>
      </div>

      {loadingTasks && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl min-h-[300px]">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-xs text-slate-400 font-mono">正在抓取最新渲染调度...</p>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onSelectTask={setActivePlaybackTask}
          onDeleteTask={deleteTask}
        />
      )}

      {showCreateDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h4 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              新建出海 AI 视频任务
            </h4>
            <form onSubmit={handleQuickCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold text-xs">任务名称</label>
                <input
                  type="text"
                  required
                  placeholder="例如：5叶静音冷风扇出口包装线"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold text-xs">功能方向</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewType('A')}
                    className={`p-3 rounded-xl border text-center text-xs cursor-pointer transition-all ${
                      newType === 'A' ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    TikTok 视频仿写
                  </div>
                  <div
                    onClick={() => setNewType('B')}
                    className={`p-3 rounded-xl border text-center text-xs cursor-pointer transition-all ${
                      newType === 'B' ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    中文原片出海汉化
                  </div>
                </div>
              </div>
              {newType === 'A' ? (
                <div>
                  <label className="text-slate-300 block mb-1.5 font-semibold text-xs">TikTok 目标视频链接 (选填)</label>
                  <input
                    type="text"
                    placeholder="https://www.tiktok.com/@..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-slate-300 block mb-1.5 font-semibold text-xs">工厂原片视频文件名称 (选填)</label>
                  <input
                    type="text"
                    placeholder="例如：machinery_line.mp4"
                    value={newFile}
                    onChange={(e) => setNewFile(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition-all text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-blue-500/20"
                >
                  创建并挂载到看板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePlaybackTask && (
        <TaskDetailModal task={activePlaybackTask} onClose={() => setActivePlaybackTask(null)} />
      )}
    </div>
  );
}
