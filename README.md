# 出海AI视频工作台

**前端地址**: http://127.0.0.1:3000

---

## 🚀 快速启动

```bash
cd E:\ai视频工作台
npm install
npm run dev
```

---

## 📁 项目结构

```
├── server.ts              # 后端API服务
├── .env                   # 环境变量配置
├── src/
│   ├── App.tsx            # 前端主页面
│   └── components/
│       ├── AideoAgent.tsx     # Aideo Agent页面
│       ├── Step1Transcript.tsx # 提取逐字稿
│       ├── Step2Script.tsx    # 脚本仿写
│       ├── Step3Video.tsx     # 视频生成
│       └── ChineseToEnglish.tsx # 中文转英文
└── docs/
    ├── DEVELOPMENT.md     # 开发文档
    └── FRONTEND.md        # 前端文档
```

---

## ✅ 已完成API

| API | 方法 | 说明 |
|-----|------|------|
| `/api/ai/asr` | POST | ASR语音识别 |
| `/api/ai/rewrite` | POST | 脚本仿写 |
| `/api/vod/apply-upload` | POST | VOD获取上传凭证 |
| `/api/vod/commit-upload` | POST | VOD确认上传 |
| `/api/vod/media-info` | POST | VOD媒体信息 |

---

## 📖 详细文档

- [开发文档](docs/DEVELOPMENT.md) - API对接、配置说明
- [前端文档](docs/FRONTEND.md) - 页面结构、组件说明

---

**VOD空间**: spacegpn4h0  
**最后更新**: 2026-05-26