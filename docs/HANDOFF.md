# 交接文档

## 项目概述

出海AI视频工作台，为出海企业提供 AI 视频处理工具。核心功能：

- **A功能**：TK视频仿写（链接 → 逐字稿 → 脚本 → 视频）
- **B功能**：中文转英文（中文视频 → 翻译配音口型对齐 → 英文视频）

技术栈：React 19 + Vite 6 + TailwindCSS 4 + Express 4 + TypeScript 5.8

## 必读文档

新对话开始前，按以下顺序阅读：

1. `docs/PROJECT_OVERVIEW.md` - 项目整体说明
2. `docs/ARCHITECTURE.md` - 技术架构
3. `docs/API_CONTRACTS.md` - 接口与字段
4. `docs/CODING_RULES.md` - 代码规范
5. `docs/TASK_PROGRESS.md` - 任务进度
6. `docs/TESTING_GUIDE.md` - 测试标准
7. `docs/DEVELOPMENT.md` - 开发文档（API对接详情）
8. `docs/FRONTEND.md` - 前端文档（页面结构）

## 当前状态

- **版本**：v2.0
- **最后更新**：2026-05-26
- **状态**：功能已打通，文档已补齐，准备开始重构

## 已完成的工作

### 功能层面

| 功能 | 状态 | 说明 |
|------|------|------|
| ASR 逐字稿提取 | ✅ 可用 | MediaKit 调用成功 |
| 脚本仿写 | ✅ 可用 | ARK LLM 调用成功 |
| 翻译 | ✅ 可用 | ARK LLM 调用成功 |
| VOD SDK | ✅ 调通 | @volcengine/openapi |
| Aideo Agent | ✅ 调通 | VE CLI 临时方案 |
| 视频生成 | ⬜ 未接入 | 使用 mock 视频 |
| 抖音下载 | ⬜ 未集成 | Playwright 方案存在 |

### 文档层面

| 文档 | 状态 | 说明 |
|------|------|------|
| PROJECT_OVERVIEW.md | ✅ | 项目整体说明 |
| ARCHITECTURE.md | ✅ | 技术架构 |
| API_CONTRACTS.md | ✅ | 接口与字段 |
| CODING_RULES.md | ✅ | 代码规范 |
| TASK_PROGRESS.md | ✅ | 任务进度 |
| TESTING_GUIDE.md | ✅ | 测试标准 |
| HANDOFF.md | ✅ | 本文件 |
| DEVELOPMENT.md | ✅ | API对接详情 |
| FRONTEND.md | ✅ | 前端页面结构 |

## 下一步工作

### 优先级 1：前端基础架构重构

1. 引入 react-router-dom 替代 state 路由
2. 拆分 App.tsx 为页面级组件
3. 建立 services/api 层
4. 引入状态管理（Context 或 zustand）

### 优先级 2：后端重构

1. 拆分 server.ts 为路由 + 服务
2. Aideo Agent 从 VE CLI 迁移到 SDK
3. 任务持久化

### 优先级 3：功能完善

1. 视频生成接入（即梦/可灵）
2. VOD 上传完整流程
3. 积分系统后端管理

## 关键技术决策

### 路由方案

推荐使用 react-router-dom，因为：
- 项目已有多个页面（看板、A功能3步、B功能、历史、个人中心、Aideo）
- 需要支持浏览器前进后退
- 需要支持 URL 直接访问

### 状态管理

推荐使用 Context + useReducer，因为：
- 项目规模中等，不需要 Redux 的复杂性
- 主要状态是任务列表和用户积分
- 组件树不深，Context 足够

### 后端持久化

推荐使用 JSON 文件存储，因为：
- 项目初期数据量小
- 不需要数据库的复杂性
- 方便备份和迁移

## 环境配置

### .env 文件

```env
PORT=3000
NODE_ENV=development

# 火山引擎 MediaKit
MEDIAKIT_API_KEY=your-mediakit-api-key
MEDIAKIT_BASE_URL=https://mediakit.cn-beijing.volces.com/api/v1

# 火山方舟 ARK
ARK_API_KEY=your-ark-api-key
ARK_MODEL=doubao-pro-32k
ARK_BASE_URL=https://amk-ark.cn-beijing.volces.com/api/v1

# TOS 存储
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_REGION=cn-beijing
TOS_BUCKET=aimediakit
TOS_PUBLIC_BASE_URL=https://aimediakit.tos-cn-beijing.volces.com

# VOD 配置
VOD_SPACE_NAME=spacegpn4h0

# 火山引擎凭证
VOLC_ACCESS_KEY_ID=your-volc-access-key-id
VOLC_SECRET_ACCESS_KEY=your-volc-secret-access-key
```

### 启动命令

```bash
cd E:\ai视频工作台
npm install
npm run dev
```

### 访问地址

http://127.0.0.1:3000

## 注意事项

1. **不要删除已有功能**：重构时移动代码而非删除
2. **保持 API 兼容**：前端调用的接口路径不要变
3. **逐步重构**：每次只改一个模块，确保可回退
4. **测试验证**：每次修改后运行 `npm run build` 和 `npm run lint`
5. **更新文档**：修改后同步更新相关文档

## 文件结构

```
E:\ai视频工作台\
├── docs/                           # 项目文档
│   ├── PROJECT_OVERVIEW.md         # 项目整体说明
│   ├── ARCHITECTURE.md             # 技术架构
│   ├── API_CONTRACTS.md            # 接口与字段
│   ├── CODING_RULES.md             # 代码规范
│   ├── TASK_PROGRESS.md            # 任务进度
│   ├── TESTING_GUIDE.md            # 测试标准
│   ├── HANDOFF.md                  # 交接文档（本文件）
│   ├── DEVELOPMENT.md              # API对接详情
│   └── FRONTEND.md                 # 前端页面结构
├── src/
│   ├── components/                 # React 组件
│   │   ├── AideoAgent.tsx          # Aideo Agent 页面
│   │   ├── ChineseToEnglish.tsx    # B功能-中文转英文
│   │   ├── KanbanBoard.tsx         # 任务看板
│   │   ├── Step1Transcript.tsx     # A功能-提取逐字稿
│   │   ├── Step2Script.tsx         # A功能-脚本仿写
│   │   ├── Step3Video.tsx          # A功能-视频生成
│   │   ├── StepIndicator.tsx       # 步骤指示器
│   │   ├── TaskHistory.tsx         # 任务历史
│   │   ├── UserProfile.tsx         # 用户中心
│   │   └── VideoModal.tsx          # 视频弹窗
│   ├── pages/
│   │   └── aideo-agent.html        # 独立HTML（未使用）
│   ├── services/
│   │   └── douyin-downloader.ts    # 抖音下载器（未集成）
│   ├── App.tsx                     # 主页面（过大，需拆分）
│   ├── index.css                   # 全局样式
│   ├── main.tsx                    # 入口
│   └── types.ts                    # 类型定义
├── server.ts                       # 后端API（过大，需拆分）
├── .env                            # 环境变量
├── package.json                    # 依赖配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 配置
└── index.html                      # HTML 入口
```
