# 技术架构说明

## 1. 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (SPA)                       │
│  React 19 + TailwindCSS 4 + Vite 6                  │
│  ┌─────────┬──────────┬──────────┬─────────┐        │
│  │ 看板首页 │ A功能流程 │ B功能页面 │ Aideo   │        │
│  │ Kanban  │ Step1-3  │ 中转英   │ Agent   │        │
│  └────┬────┴────┬─────┴────┬─────┴────┬────┘        │
│       └─────────┴──────────┴──────────┘              │
│                    fetch API                          │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│              Express API Server (server.ts)           │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │ /api/ai  │ /api/vod │ /api/    │ /api/    │      │
│  │ ASR      │ VOD上传  │ aideo    │ tasks    │      │
│  │ Rewrite  │ 凭证管理 │ Agent    │ 任务CRUD │      │
│  │ Translate│          │          │          │      │
│  └────┬─────┴────┬─────┴────┬─────┴──────────┘      │
│       │          │          │                         │
│  MediaKit    VOD SDK    VE CLI/SDK                    │
│  (ASR)       (@volcengine/openapi)                    │
└───────┼──────────┼──────────┼─────────────────────────┘
        │          │          │
┌───────┴──────────┴──────────┴─────────────────────────┐
│              火山引擎云服务                              │
│  ┌──────────┬──────────┬──────────┬──────────┐        │
│  │ MediaKit │ ARK LLM  │ VOD      │ TOS      │        │
│  │ ASR识别  │ 脚本仿写 │ 视频点播 │ 对象存储 │        │
│  └──────────┴──────────┴──────────┴──────────┘        │
└───────────────────────────────────────────────────────┘
```

## 2. 前端架构

### 2.1 当前结构（待重构）

```
src/
├── main.tsx              # 入口
├── App.tsx               # 主页面（过于庞大，包含路由+状态+业务逻辑）
├── index.css             # 全局样式（TailwindCSS）
├── types.ts              # 类型定义
├── components/
│   ├── KanbanBoard.tsx   # 任务看板组件
│   ├── StepIndicator.tsx # 步骤指示器
│   ├── Step1Transcript.tsx  # A功能-提取逐字稿
│   ├── Step2Script.tsx      # A功能-脚本仿写
│   ├── Step3Video.tsx       # A功能-视频生成
│   ├── ChineseToEnglish.tsx # B功能-中文转英文
│   ├── AideoAgent.tsx       # Aideo Agent页面
│   ├── TaskHistory.tsx      # 任务历史
│   ├── UserProfile.tsx      # 用户中心
│   └── VideoModal.tsx       # 视频弹窗
├── services/
│   └── douyin-downloader.ts # 抖音下载器（未集成）
└── pages/
    └── aideo-agent.html     # 独立HTML页面（未使用）
```

### 2.2 当前路由方案

使用 `useState<PagePath>` 模拟路由，无正式路由库：

```typescript
type PagePath = '/' | '/a/step1' | '/a/step2' | '/a/step3' | '/b' | '/history' | '/profile' | '/aideo';
```

### 2.3 当前状态管理

所有状态集中在 App.tsx，通过 props 传递给子组件：

```
App.tsx
├── tasks: Task[]                    # 任务列表
├── currentPath: PagePath            # 当前页面
├── wizardStep: number               # A功能当前步骤
├── step1Url / step1Transcript       # Step1 状态
├── step2ScriptJson / step2StyleLabel # Step2 状态
├── userCredits: number              # 积分
└── showCreateDialog                 # 弹窗状态
```

## 3. 后端架构

### 3.1 当前结构（待重构）

```
server.ts（单文件，包含所有逻辑）
├── 配置区（环境变量读取）
├── VOD SDK 初始化
├── AI 函数（callMediaKitASR, callArkLLM）
├── 工具函数（detectNiche, getMockRewriteResponse）
├── 任务数据（内存数组）
├── API 路由
│   ├── GET  /api/tasks
│   ├── POST /api/tasks
│   ├── POST /api/tasks/update
│   ├── POST /api/tasks/simulate-run
│   ├── DELETE /api/tasks/:id
│   ├── POST /api/ai/asr
│   ├── POST /api/ai/rewrite
│   ├── POST /api/ai/translate
│   ├── POST /api/vod/apply-upload
│   ├── POST /api/vod/commit-upload
│   ├── POST /api/vod/media-info
│   ├── POST /api/aideo/translate
│   └── GET  /api/aideo/result/:taskId
└── 启动服务器（Vite 中间件 / 静态文件）
```

### 3.2 数据存储

当前任务数据存储在内存数组中，重启丢失：

```typescript
let tasks = [
  { id: "task-1", name: "...", type: "A", status: "completed", ... },
  // ...
];
```

### 3.3 外部调用方式

| 服务 | 调用方式 | 说明 |
|------|----------|------|
| MediaKit ASR | fetch HTTP | 提交任务 + 轮询结果 |
| ARK LLM | fetch HTTP | 直接调用 chat completions |
| VOD | @volcengine/openapi SDK | ApplyUploadInfo, CommitUploadInfo, GetMediaInfos |
| Aideo Agent | VE CLI (execSync) | 临时方案，需替换为 SDK |

## 4. 数据流

### 4.1 A功能数据流

```
用户输入TK链接
    │
    ▼
Step1: POST /api/ai/asr { url }
    │  → MediaKit ASR → 轮询 → 返回 { transcript, detectedNiche }
    ▼
Step2: POST /api/ai/rewrite { transcript, productInfo, anchorStyle }
    │  → ARK LLM → 返回 { hook, cta, scenes[] }
    ▼
Step3: 上传素材 + 合成视频（待接入即梦/可灵API）
    │  → 返回视频URL
    ▼
POST /api/tasks 创建任务记录
```

### 4.2 B功能数据流

```
用户上传中文视频
    │
    ▼
POST /api/ai/translate { originalContent, clonedVoice }
    │  → ARK LLM 翻译 → 返回 { englishTitle, translatedTranscript, scenes[] }
    ▼
视频翻译通过 Aideo Agent 处理（待完善）
    │
    ▼
POST /api/tasks 创建任务记录
```

## 5. 样式方案

- 使用 TailwindCSS 4.x，通过 Vite 插件集成
- 暗色主题为主：bg-[#0F172A], text-slate-100, border-[#334155]
- 响应式：mobile-first，断点 sm/md/lg/xl
- 动画：使用 TailwindCSS 内置动画类 + motion 库

## 6. 待重构方向

### 6.1 前端

1. 引入 react-router-dom 替代 state 路由
2. 拆分 App.tsx，提取页面级组件
3. 建立独立的 services/api 层
4. 引入状态管理（Context 或 zustand）
5. 组件按功能模块组织

### 6.2 后端

1. 拆分 server.ts 为路由 + 服务 + 中间件
2. 引入文件/数据库持久化
3. Aideo Agent 从 VE CLI 迁移到 SDK
4. 添加错误处理中间件
5. 添加请求日志中间件
