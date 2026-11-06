import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/Toast';
import { STATUS_LABELS } from '../constants';
import { Upload, Video, Loader2, CheckCircle, AlertCircle, Download, Languages, FileVideo, X, RefreshCw, Clock, Trash2, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: '英语' },
  { code: 'ja', label: '日语' },
  { code: 'ko', label: '韩语' },
  { code: 'es', label: '西班牙语' },
  { code: 'fr', label: '法语' },
  { code: 'de', label: '德语' },
  { code: 'pt', label: '葡萄牙语' },
  { code: 'ar', label: '阿拉伯语' },
  { code: 'th', label: '泰语' },
  { code: 'vi', label: '越南语' },
  { code: 'id', label: '印尼语' },
  { code: 'ru', label: '俄语' },
];

const TRANSLATION_TYPES = [
  { value: 'SubtitleTranslation', label: '字幕翻译', desc: '添加翻译字幕，保留原声' },
  { value: 'VoiceTranslation', label: '语音翻译', desc: 'AI 克隆语音+字幕' },
];

export default function BFunctionPage() {
  const { tasks, createTask, updateTask, deleteTask, setActivePlaybackTask } = useApp();
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 翻译选项
  const [targetLang, setTargetLang] = useState('en');
  const [translationTypes, setTranslationTypes] = useState<string[]>(['SubtitleTranslation', 'VoiceTranslation']);

  const bTasks = tasks.filter(t => t.type === 'B').slice(0, 8);

  // 轮询翻译状态
  const pollingRef = useRef<any>(null);
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const startPolling = (projectId: string, tid: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/ai/translation-status/${projectId}`);
        const data = await resp.json();
        if (!data.success) return;

        if (data.status === 'Completed') {
          clearInterval(pollingRef.current);
          setProgress(100);
          setStatusText('翻译完成');
          setLoading(false);
          setSuccessMsg('视频翻译完成！');
          toast('翻译完成', 'success');
          updateTask({ id: tid, progress: 100, status: 'completed' });
        } else if (data.status === 'Failed') {
          clearInterval(pollingRef.current);
          setProgress(0);
          setStatusText('');
          setLoading(false);
          setErrorMsg(data.error || '翻译失败');
          toast(`翻译失败: ${data.error || '未知错误'}`, 'error');
          updateTask({ id: tid, progress: 0, status: 'pending' });
        } else {
          const p = Math.min(data.progress || 50, 95);
          setProgress(p);
          setStatusText(`翻译中... (${data.status})`);
          updateTask({ id: tid, progress: p });
        }
      } catch {}
    }, 5000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) { toast('文件超过 500MB 限制', 'error'); return; }
    if (!f.type.startsWith('video/')) { toast('请选择视频文件', 'error'); return; }
    setVideoFile(f); setOutputUrl(''); setErrorMsg(''); setSuccessMsg('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) { toast('文件超过 500MB 限制', 'error'); return; }
    if (!f.type.startsWith('video/')) { toast('请选择视频文件', 'error'); return; }
    setVideoFile(f);
    setOutputUrl('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const toggleType = (val: string) => {
    setTranslationTypes(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleProcess = async () => {
    if (!videoFile) { toast('请先上传视频文件', 'error'); return; }
    if (translationTypes.length === 0) { toast('请至少选择一种翻译类型', 'error'); return; }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    setProgress(5);
    setOutputUrl('');

    const task = await createTask({ name: `数字人翻译 - ${LANGUAGES.find(l => l.code === targetLang)?.label || targetLang}`, type: 'B', videoFileName: videoFile.name });
    const tid = task?.id || null;
    if (task) { setTaskId(task.id); updateTask({ id: task.id, progress: 10, status: 'processing' }); }

    setProgress(15);
    setStatusText('上传视频到云端...');

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const uploadResp = await fetch('/api/vod/upload-file', { method: 'POST', body: formData });
      if (!uploadResp.ok) {
        const errData = await uploadResp.json().catch(() => ({ error: '上传请求失败' }));
        throw new Error(errData.error || `上传失败(${uploadResp.status})`);
      }
      const uploadData = await uploadResp.json();
      if (!uploadData.success) throw new Error(uploadData.error || '上传失败');

      setProgress(30);
      setStatusText('上传完成，提交翻译任务...');
      toast('视频上传成功，提交翻译中...', 'success');

      const procResp = await fetch('/api/ai/process-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vid: uploadData.vid,
          targetLanguage: targetLang,
          translationTypeList: translationTypes,
        }),
      });
      const procData = await procResp.json();

      if (!procResp.ok || !procData.success) {
        throw new Error(procData.error || '翻译任务创建失败');
      }

      setProgress(40);
      setStatusText('翻译任务已提交，处理中...');
      if (tid) updateTask({ id: tid, progress: 40, status: 'processing', projectId: procData.projectId });

      // 开始轮询状态
      startPolling(procData.projectId, tid);

    } catch (e: any) {
      console.error('[B] 处理失败:', e.message);
      setProgress(0);
      setStatusText('');
      setErrorMsg(e.message || '处理失败，请重试');
      toast(`处理失败: ${e.message}`, 'error');
      setLoading(false);
      if (tid) updateTask({ id: tid, progress: 0, status: 'pending' });
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
          <Languages className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">B 功能 · AI 视频翻译</h2>
          <p className="text-xs text-slate-400">上传中文视频 → 选择翻译类型和目标语言 → AI 自动翻译输出</p>
        </div>
      </div>

      {/* 上传 + 选项区域 */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 space-y-5">
        {/* 文件上传 */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragOver ? 'border-purple-400 bg-purple-500/10' : videoFile ? 'border-purple-500 bg-purple-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/20'}`}
        >
          <input ref={fileRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          {videoFile ? (
            <div className="space-y-2">
              <FileVideo className="w-10 h-10 text-purple-400 mx-auto" />
              <p className="text-sm text-white font-medium">{videoFile.name}</p>
              <p className="text-xs text-slate-400">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-slate-500">点击更换 · 拖拽更换</p>
              <button onClick={e => { e.stopPropagation(); setVideoFile(null); }} className="text-xs text-red-400 hover:text-red-300">移除</button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300">拖拽视频文件到此处，或点击上传</p>
              <p className="text-xs text-slate-500">支持 MP4, MOV, AVI</p>
            </div>
          )}
        </div>

        {/* 翻译类型 */}
        <div>
          <label className="text-xs font-bold text-white mb-2 block">翻译类型</label>
          <div className="grid grid-cols-2 gap-3">
            {TRANSLATION_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  translationTypes.includes(t.value)
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                }`}
              >
                <span className={`text-xs font-bold ${translationTypes.includes(t.value) ? 'text-purple-400' : 'text-slate-300'}`}>
                  {t.label}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 目标语言 */}
        <div>
          <label className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            目标语言
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setTargetLang(lang.code)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  targetLang === lang.code
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && <div className="flex items-center gap-2 text-red-400 bg-red-950/25 border border-red-900/50 rounded-lg p-3 text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{errorMsg}</div>}

        {successMsg && <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/25 border border-emerald-900/50 rounded-lg p-3 text-xs"><CheckCircle className="w-3.5 h-3.5 shrink-0" />{successMsg}</div>}

        <button onClick={handleProcess} disabled={loading || !videoFile} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${loading || !videoFile ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{statusText || '处理中...'}</> : <><Languages className="w-4 h-4" />开始翻译</>}
        </button>

        {loading && (
          <div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} /></div>
            <div className="flex justify-between mt-1"><span className="text-xs text-slate-500">{statusText}</span><span className="text-xs text-slate-400 font-bold">{progress}%</span></div>
          </div>
        )}
      </div>

      {/* 输出视频 */}
      {outputUrl && (
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />翻译完成</span>
            <a href={outputUrl} download className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Download className="w-3.5 h-3.5" />下载视频</a>
          </div>
          <video src={outputUrl} controls className="w-full" />
        </div>
      )}

      {/* 历史任务列表 */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            处理历史
          </span>
          <span className="text-xs text-slate-500 font-mono">{bTasks.length} 条记录</span>
        </div>

        {bTasks.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">暂无处理记录</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setActivePlaybackTask(task)}
                className="group flex items-center gap-3 p-3 bg-slate-900 border border-slate-700/60 rounded-xl hover:border-slate-600 cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  {task.status === 'processing' ? (
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : task.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Video className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate group-hover:text-purple-400 transition-colors">{task.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      task.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{task.progress}%</span>
                    {task.status === 'processing' && (
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
