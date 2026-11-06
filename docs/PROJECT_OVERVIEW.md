# 项目整体说明

## 项目名称

出海AI视频工作台

## 项目类型

Web 全栈应用（SPA + API Server）

## 项目目标

为出海企业提供 AI 视频处理工具平台，核心解决两个业务场景：

- **A功能（TK视频仿写）**：粘贴 TikTok/抖音 对标视频链接 → ASR 提取逐字稿 → 结合产品信息 AI 仿写脚本 → 配图生成视频
- **B功能（中文转英文）**：上传中文口播视频 → AI 翻译文案 → 克隆配音 → 口型对齐 → 输出英文版视频

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19.x |
| 构建工具 | Vite | 6.x |
| CSS 框架 | TailwindCSS | 4.x |
| 后端框架 | Express | 4.x |
| 运行时 | Node.js + tsx | - |
| 类型系统 | TypeScript | 5.8 |
| 图标库 | lucide-react | 0.546 |
| 动画库 | motion | 12.x |
| AI SDK | 火山引擎 MediaKit / ARK / Aideo Agent | - |
| 存储 SDK | @volcengine/openapi (VOD) | 1.36 |
| 视频下载 | Playwright | 1.60 |

## 项目环境

```
项目名称：出海AI视频工作台
项目类型：Web 全栈（SPA + Express API）
技术栈：React 19 + Vite 6 + TailwindCSS 4 + Express 4 + TypeScript 5.8
包管理器：npm
启动命令：npm run dev（开发）/ npm run start（生产）
构建命令：npm run build
类型检查：npm run lint（tsc --noEmit）
前端地址：http://127.0.0.1:3000
后端地址：同上（Express 托管 Vite 中间件）
```

## 外部服务依赖

| 服务 | 用途 | 配置项 |
|------|------|--------|
| 火山引擎 MediaKit | ASR 语音识别 | MEDIAKIT_API_KEY, MEDIAKIT_BASE_URL |
| 火山方舟 ARK | 大模型脚本仿写 | ARK_API_KEY, ARK_BASE_URL, ARK_MODEL |
| 火山引擎 VOD | 视频上传/管理 | VOLC_ACCESS_KEY_ID, VOLC_SECRET_ACCESS_KEY, VOD_SPACE_NAME |
| 火山引擎 TOS | 对象存储 | TOS_ENDPOINT, TOS_REGION, TOS_BUCKET |
| Aideo Agent | AI 视频处理（翻译/高光/理解/创意） | 通过 VOD SDK 调用 |

## 当前版本状态

- 版本：v2.0（功能已打通，待重构优化）
- 最后更新：2026-05-26
- 状态：功能可用，代码结构需要重构

## 已知问题

1. App.tsx 过于庞大，所有页面路由和业务逻辑集中在一个文件
2. 组件内硬编码了大量模拟数据和模拟进度条
3. 没有使用正式路由库，用 state 模拟路由
4. server.ts 所有路由写在一个文件，缺乏分层
5. 前端没有独立的 API 调用层（services），直接在组件中 fetch
6. 任务数据存储在内存中，重启丢失
7. 部分功能使用 VE CLI（execSync）而非 SDK
