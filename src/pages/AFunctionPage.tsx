import React, { useState, useRef } from 'react';
import { useToast } from '../components/Toast';
import {
  Sparkles, Copy, Check, Upload,
  Wand2, Download, Film,
  Image, Video, X
} from 'lucide-react';

interface Scene {
  sceneNumber: number;
  visual: string;
  voiceover: string;
  duration: number;
}

export default function AFunctionPage() {
  const { toast } = useToast();

  // 逐字稿
  const [transcript, setTranscript] = useState('');
  const [asrUrl, setAsrUrl] = useState('');
  const [asrLoading, setAsrLoading] = useState(false);

  // LLM
  const [productInfo, setProductInfo] = useState('');
  const [anchorStyle, setAnchorStyle] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [hook, setHook] = useState('');
  const [cta, setCta] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);

  // 素材
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [materialVids, setMaterialVids] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 生成
  const [genLoading, setGenLoading] = useState(false);
  const [genVideoUrl, setGenVideoUrl] = useState('');

  // ASR
  const handleASR = async () => {
    const url = asrUrl.trim();
    if (!url) { toast('请输入视频链接', 'error'); return; }
    if (!/https?:\/\/[^\s]+/.test(url)) { toast('请输入有效的视频链接', 'error'); return; }
    setAsrLoading(true);
    setTranscript('');
    toast('正在提取逐字稿...', 'info');

    try {
      const resp = await fetch('/api/ai/asr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await resp.json();
      if (data.transcript && data.transcript.length > 10) {
        setTranscript(data.transcript);
        toast('逐字稿提取成功', 'success');
      } else {
        toast(data.error || 'ASR 未识别到语音内容', 'error');
      }
    } catch (e: any) {
      toast(`ASR 失败: ${e.message}`, 'error');
    } finally { setAsrLoading(false); }
  };

  // LLM
  const handleRewrite = async () => {
    if (!transcript.trim()) { toast('请先输入或提取逐字稿', 'error'); return; }
    setLlmLoading(true);
    toast('正在生成脚本...', 'info');

    try {
      const resp = await fetch('/api/ai/rewrite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript, productInfo, anchorStyle }) });
      const data = await resp.json();
      if (!resp.ok) { toast(data.error || 'LLM 调用失败', 'error'); return; }
      setHook(data.hook || '');
      setCta(data.cta || '');
      setScenes(data.scenes || []);
      toast('脚本生成成功，可以编辑', 'success');
    } catch (e: any) {
      toast(`LLM 失败: ${e.message}`, 'error');
    } finally { setLlmLoading(false); }
  };

  // 素材
  const uploadFileToVOD = async (file: File) => {
    const key = file.name + file.size;
    setUploadingFiles(p => new Set(p).add(key));
    try {
      const fd = new FormData(); fd.append('file', file);
      const resp = await fetch('/api/vod/upload-file', { method: 'POST', body: fd });
      const data = await resp.json();
      if (data.success && data.vid) {
        setMaterialVids(p => [...p, data.vid]);
        toast(`${file.name} 上传成功`, 'success');
      } else {
        toast(`${file.name} 上传失败: ${data.error || '未知错误'}`, 'error');
      }
    } catch (e: any) {
      toast(`${file.name} 上传失败: ${e.message}`, 'error');
    } finally { setUploadingFiles(p => { const n = new Set(p); n.delete(key); return n; }); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      const f = e.target.files[i];
      if (f.size > 500 * 1024 * 1024) { toast(`${f.name} 超过 500MB 限制`, 'error'); continue; }
      if (f.type.startsWith('image/') || f.type.startsWith('video/')) { setUploadedFiles(p => [...p, f]); uploadFileToVOD(f); }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const f = e.dataTransfer.files[i];
      if (f.size > 500 * 1024 * 1024) { toast(`${f.name} 超过 500MB 限制`, 'error'); continue; }
      if (f.type.startsWith('image/') || f.type.startsWith('video/')) { setUploadedFiles(p => [...p, f]); uploadFileToVOD(f); }
    }
  };

  // 生成视频
  const handleGenerate = async () => {
    setGenLoading(true);
    toast('正在生成视频...', 'info');
    try {
      const resp = await fetch('/api/ai/generate-video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scriptJson: { hook, cta, scenes }, materialVids }) });
      const data = await resp.json();
      if (!resp.ok || !data.success) { toast(data.error || '视频生成服务暂未接入', 'error'); return; }
      setGenVideoUrl(data.videoUrl);
      toast('视频生成成功', 'success');
    } catch (e: any) { toast(`生成失败: ${e.message}`, 'error'); }
    finally { setGenLoading(false); }
  };

  const updateScene = (i: number, field: keyof Scene, value: string | number) => {
    setScenes(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));
  };

  const copyScript = () => {
    navigator.clipboard.writeText([hook, ...scenes.map(s => s.voiceover), cta].filter(Boolean).join('\n'));
    toast('脚本已复制', 'success');
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">A 功能 · 智能视频工作台</h2>
          <p className="text-xs text-slate-400">逐字稿 → 脚本仿写 → 素材 → 生成视频</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左列 */}
        <div className="space-y-5">
          {/* 逐字稿 */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="text-sm font-bold text-white pb-2 border-b border-slate-700">逐字稿</div>
            <div className="flex gap-2">
              <input value={asrUrl} onChange={e => setAsrUrl(e.target.value)} placeholder="视频链接（可选，自动提取）" className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              <button onClick={handleASR} disabled={asrLoading} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg disabled:bg-slate-700 disabled:text-slate-400 shrink-0">
                {asrLoading ? '...' : '提取'}
              </button>
            </div>
            <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={6} placeholder="在此粘贴视频逐字稿，或用上方链接自动提取..." className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed" />
          </div>

          {/* LLM */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="text-sm font-bold text-white pb-2 border-b border-slate-700">AI 脚本仿写</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={productInfo} onChange={e => setProductInfo(e.target.value)} placeholder="产品信息" className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
              <input value={anchorStyle} onChange={e => setAnchorStyle(e.target.value)} placeholder="播主风格" className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <button onClick={handleRewrite} disabled={llmLoading || !transcript.trim()} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs transition ${llmLoading || !transcript.trim() ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
              <Sparkles className="w-4 h-4" />{llmLoading ? '生成中...' : '仿写英文脚本'}
            </button>
          </div>

          {/* 脚本编辑 */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="text-sm font-bold text-white">脚本编辑</span>
              <button onClick={copyScript} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" />复制</button>
            </div>
            <div>
              <label className="text-[10px] text-amber-400 font-bold mb-1 block">Hook</label>
              <textarea value={hook} onChange={e => setHook(e.target.value)} rows={2} placeholder="开场钩子..." className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-200 focus:outline-none focus:border-amber-500 resize-y" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold block">场景台词</label>
              {scenes.length === 0 && <p className="text-xs text-slate-600 italic">点击上方"仿写英文脚本"生成</p>}
              {scenes.map((scene, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-bold">场景 {scene.sceneNumber || i + 1}</span>
                    <input type="number" value={scene.duration} onChange={e => updateScene(i, 'duration', Number(e.target.value))} className="w-14 text-[10px] text-center bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none" min={1} max={60} />
                    <span className="text-[10px] text-slate-500">秒</span>
                  </div>
                  <input value={scene.visual} onChange={e => updateScene(i, 'visual', e.target.value)} placeholder="画面描述" className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-400 focus:outline-none" />
                  <textarea value={scene.voiceover} onChange={e => updateScene(i, 'voiceover', e.target.value)} rows={2} placeholder="英文台词" className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 resize-y" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] text-green-400 font-bold mb-1 block">CTA</label>
              <textarea value={cta} onChange={e => setCta(e.target.value)} rows={2} placeholder="行动号召..." className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-green-200 focus:outline-none focus:border-green-500 resize-y" />
            </div>
          </div>
        </div>

        {/* 右列 */}
        <div className="space-y-5">
          {/* 素材 */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="text-sm font-bold text-white pb-2 border-b border-slate-700">素材管理</div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragOver ? 'border-amber-400 bg-amber-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/20'}`}
            >
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} className="hidden" />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300">拖拽或点击上传素材</p>
              <p className="text-xs text-slate-500">图片 / 视频</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {uploadedFiles.map((f, i) => {
                  const key = f.name + f.size;
                  const isUploading = uploadingFiles.has(key);
                  const hasVid = !!materialVids[i];
                  return (
                    <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        {f.type.startsWith('video/') ? <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Image className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                        <span className="text-slate-300 truncate">{f.name}</span>
                        <span className="text-slate-500">({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
                        {isUploading && <span className="text-amber-400">上传中...</span>}
                        {hasVid && <span className="text-emerald-400">✓</span>}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setUploadedFiles(p => p.filter((_, j) => j !== i)); setMaterialVids(p => p.filter((_, j) => j !== i)); }} className="text-red-400 hover:text-red-300 shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 生成视频 */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="text-sm font-bold text-white pb-2 border-b border-slate-700">生成视频</div>
            <button onClick={handleGenerate} disabled={genLoading || scenes.length === 0} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${genLoading || scenes.length === 0 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}>
              <Film className="w-4 h-4" />{genLoading ? '生成中...' : '生成视频'}
            </button>
            {scenes.length === 0 && <p className="text-[10px] text-slate-600 text-center">需要先生成脚本</p>}

            {genVideoUrl && (
              <div className="bg-black rounded-xl overflow-hidden">
                <video src={genVideoUrl} controls className="w-full" />
                <div className="p-3 bg-slate-900/80 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">✓ 成品视频</span>
                  <a href={genVideoUrl} download className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Download className="w-3.5 h-3.5" />下载</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
