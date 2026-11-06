import React, { useState } from 'react';
import { Task } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { X, Play, Copy, Check, FileText, Globe, Clock, RefreshCw } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const [copied, setCopied] = useState(false);

  let parsedScript: any = null;
  if (task.rewrittenScript) {
    try { parsedScript = JSON.parse(task.rewrittenScript); } catch { parsedScript = null; }
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasVideo = !!task.generatedVideoUrl;
  const videoUrl = task.generatedVideoUrl;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${STATUS_COLORS[task.status] || STATUS_COLORS.pending}`}>
                {STATUS_LABELS[task.status] || task.status}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                task.type === 'A' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {task.type === 'A' ? 'A·工作台' : 'B·数字人'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white truncate">{task.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:h-full">
            
            {/* Left: Video or Progress */}
            <div className="bg-black flex items-center justify-center min-h-[280px] lg:min-h-0 relative">
              {hasVideo ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  {task.status === 'processing' ? (
                    <>
                      <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                      <span className="text-sm text-blue-300 font-bold">正在处理中...</span>
                      <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{task.progress}%</span>
                    </>
                  ) : task.status === 'pending' ? (
                    <>
                      <Clock className="w-10 h-10 text-slate-500 mb-4" />
                      <span className="text-sm text-slate-400">等待开始处理</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-10 h-10 text-slate-600 mb-4" />
                      <span className="text-sm text-slate-500">暂无视频内容</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: Task Details */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-mono">处理进度</span>
                  <span className="text-slate-300 font-bold">{task.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} style={{ width: `${task.progress}%` }} />
                </div>
              </div>

              {/* TikTok URL */}
              {task.tiktokUrl && (
                <div>
                  <span className="text-xs text-slate-500 font-mono block mb-1">来源链接</span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate font-mono" title={task.tiktokUrl}>
                    {task.tiktokUrl}
                  </p>
                </div>
              )}

              {/* Transcript */}
              {task.transcript && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-mono">ASR 逐字稿</span>
                    <button onClick={() => handleCopyText(task.transcript || '')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono">
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      复制
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all font-mono">
                    {task.transcript}
                  </p>
                </div>
              )}

              {/* Rewritten Script / Scenes */}
              {parsedScript ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-mono">AI 仿写脚本</span>
                    <button onClick={() => handleCopyText(parsedScript.scenes?.map((s: any) => `[${s.sceneNumber}] ${s.voiceover}`).join('\n') || parsedScript.hook || '')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono">
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      复制脚本
                    </button>
                  </div>
                  {parsedScript.hook && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg mb-2">
                      <span className="text-amber-400 text-xs font-bold">Hook: </span>
                      <span className="text-amber-200 text-xs">{parsedScript.hook}</span>
                    </div>
                  )}
                  {parsedScript.cta && (
                    <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-lg mb-2">
                      <span className="text-green-400 text-xs font-bold">CTA: </span>
                      <span className="text-green-200 text-xs">{parsedScript.cta}</span>
                    </div>
                  )}
                  {parsedScript.scenes?.map((scene: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-2">
                      <div className="flex items-center justify-between text-blue-400 text-xs font-bold mb-1">
                        <span>场景 {scene.sceneNumber || i + 1}</span>
                        <span className="text-slate-500 text-xs">⏱ {scene.duration || 5}s</span>
                      </div>
                      <p className="text-slate-400 text-xs italic mb-1">画面: {scene.visual || scene.voiceover}</p>
                      <p className="text-white text-xs select-all">{scene.voiceover}</p>
                    </div>
                  ))}
                  {parsedScript.translatedTranscript && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap select-all">
                      {parsedScript.translatedTranscript}
                    </p>
                  )}
                </div>
              ) : task.rewrittenScript && (
                <div>
                  <span className="text-xs text-slate-500 font-mono block mb-1">脚本内容</span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-32 overflow-y-auto whitespace-pre-wrap select-all">
                    {task.rewrittenScript}
                  </p>
                </div>
              )}

              {/* No content hint */}
              {!task.transcript && !task.rewrittenScript && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="w-8 h-8 text-slate-600 mb-3" />
                  <span className="text-xs text-slate-500">暂无详细内容</span>
                  <span className="text-xs text-slate-600 mt-1">任务正在处理中，完成后可见</span>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>创建: {new Date(task.createdAt).toLocaleString()}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  ID: {task.id.slice(-8)}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TaskDetailModal };
