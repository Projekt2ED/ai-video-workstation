import React from 'react';
import { User, Shield, Key, Server } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] p-6 rounded-2xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl font-mono">
          AI
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">出海AI视频工作台</h3>
          <p className="text-xs text-slate-400 mt-1">AI 驱动的视频翻译和脚本仿写平台</p>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-[#334155] p-5 rounded-2xl space-y-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-[#334155]">
          <Key className="w-4 h-4 text-blue-400" />
          服务配置
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">ARK 大模型</span>
            </div>
            <span className="text-emerald-400 font-mono">已配置</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">MediaKit ASR</span>
            </div>
            <span className="text-emerald-400 font-mono">已配置</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">VOD 点播</span>
            </div>
            <span className="text-emerald-400 font-mono">已配置</span>
          </div>
        </div>

        <div className="p-3 bg-blue-900/10 border border-blue-900/40 rounded-xl flex items-center gap-2 text-xs text-blue-400">
          <Shield className="w-4 h-4 shrink-0" />
          <span>配置信息存储在服务端 .env 文件中，请勿泄露 API 密钥。</span>
        </div>
      </div>
    </div>
  );
}
