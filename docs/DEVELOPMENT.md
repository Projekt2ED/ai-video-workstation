# 出海AI视频工作台 - 开发文档

**版本**: v2.0  
**更新时间**: 2026-05-26  
**项目路径**: `E:\ai视频工作台`

---

## 一、项目概述

### 1.1 项目目标

为出海企业提供AI视频处理工具平台，支持：
- **A功能**：TK视频仿写（对标视频 → 逐字稿 → 脚本仿写 → 视频生成）
- **B功能**：中文视频转英文（字幕+配音+口型对齐）
- **C功能**：Aideo Agent（火山引擎智能视频处理）

### 1.2 核心能力

| 能力 | 状态 | 说明 |
|------|------|------|
| ASR语音识别 | ✅ 已完成 | 火山引擎MediaKit |
| 脚本仿写 | ✅ 已完成 | 火山方舟ARK大模型 |
| TOS对象存储 | ✅ 已完成 | 视频文件存储 |
| VOD视频点播 | ✅ SDK调通 | @volcengine/openapi |
| Aideo Agent | ✅ SDK调通 | 视频翻译/高光剪辑 |

---

## 二、技术架构

### 2.1 技术栈

```
前端: React + Vite + TailwindCSS
后端: Node.js + Express + tsx
存储: 火山引擎TOS + VOD
AI:   火山引擎MediaKit + ARK + Aideo Agent
```

### 2.2 项目结构

```
E:\ai视频工作台\
├── server.ts                    # 后端API服务
├── .env                         # 环境变量配置
├── package.json                 # 依赖配置
├── src/
│   ├── App.tsx                  # 前端主页面
│   ├── components/
│   │   ├── AideoAgent.tsx       # Aideo Agent页面
│   │   ├── Step1Transcript.tsx  # Step1: 提取逐字稿
│   │   ├── Step2Script.tsx      # Step2: 脚本仿写
│   │   ├── Step3Video.tsx       # Step3: 视频生成
│   │   └── ChineseToEnglish.tsx # 中文转英文
│   └── types.ts                 # 类型定义
└── docs/
    ├── DEVELOPMENT.md           # 开发文档（本文件）
    └── FRONTEND.md              # 前端文档
```

---

## 三、API对接详情

### 3.1 火山引擎MediaKit（ASR）

**用途**: 语音识别，提取视频逐字稿

**配置**:
```env
MEDIAKIT_API_KEY=your-mediakit-api-key
MEDIAKIT_BASE_URL=https://mediakit.cn-beijing.volces.com/api/v1
```

**API端点**:
```
POST https://mediakit.cn-beijing.volces.com/api/v1/tools/asr-subtitles
```

**调用示例**:
```javascript
const response = await fetch('/api/ai/asr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: '视频URL' })
});
```

**返回格式**:
```json
{
  "detectedNiche": "工业制品",
  "transcript": "逐字稿内容..."
}
```

---

### 3.2 火山方舟ARK（大模型）

**用途**: 脚本仿写，根据对标视频逐字稿生成新脚本

**配置**:
```env
ARK_API_KEY=your-ark-api-key
ARK_MODEL=doubao-pro-32k
ARK_BASE_URL=https://amk-ark.cn-beijing.volces.com/api/v1
```

**调用示例**:
```javascript
const response = await fetch('/api/ai/rewrite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: '对标视频逐字稿',
    productInfo: '产品信息',
    anchorStyle: '出镜人风格'
  })
});
```

**返回格式**:
```json
{
  "hook": "开场钩子",
  "cta": "行动号召",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "画面描述",
      "voiceover": "台词",
      "duration": 5
    }
  ]
}
```

---

### 3.3 火山引擎VOD SDK（重要发现！）

**用途**: 视频上传、Aideo Agent调用

**包名**: `@volcengine/openapi`

**安装**:
```bash
npm install @volcengine/openapi
```

**配置**:
```javascript
const { defaultService } = require('@volcengine/openapi').vodOpenapi;

// 设置凭证
defaultService.setAccessKeyId(process.env.VOLC_ACCESS_KEY_ID);
defaultService.setSecretKey(process.env.VOLC_SECRET_ACCESS_KEY);
defaultService.setRegion('cn-beijing');
```

**可用方法**:
```javascript
// 获取上传凭证
const uploadInfo = await defaultService.ApplyUploadInfo({
  SpaceName: 'spacegpn4h0',
  FileType: 'video'
});

// 确认上传
const commitResult = await defaultService.CommitUploadInfo({
  SpaceName: 'spacegpn4h0',
  SessionKey: 'xxx',
  Functions: [...]
});

// 获取媒体信息
const mediaInfo = await defaultService.GetMediaInfos({
  SpaceName: 'spacegpn4h0',
  Vid: 'xxx'
});
```

**返回格式（ApplyUploadInfo）**:
```json
{
  "Result": {
    "Data": {
      "UploadAddress": {
        "UploadHosts": ["tob-upload-x-d.volcvod.com"],
        "StoreInfos": [{
          "StoreUri": "tos-vod-xxx/xxx",
          "Auth": "xxx"
        }],
        "SessionKey": "xxx"
      }
    }
  }
}
```

---

### 3.4 Aideo Agent API

**用途**: AI视频处理（翻译、高光剪辑、视频理解等）

**技能类型**:

| SkillType | 功能 | 说明 |
|-----------|------|------|
| AITranslation | 视频翻译 | 字幕+配音+口型对齐 |
| Highlight | 高光剪辑 | 自动生成1-3分钟集锦 |
| Vision | 视频理解 | 多模态大模型分析 |
| VCreative | 创意视频 | 图片转视频、视频拼接 |

**调用方式**:

#### 方式1：自然语言驱动
```javascript
{
  "SpaceName": "spacegpn4h0",
  "Vid": "视频ID",
  "Prompt": "帮我翻译这个视频从中文翻译成英语"
}
```

#### 方式2：指定技能驱动
```javascript
{
  "SpaceName": "spacegpn4h0",
  "Vid": "视频ID",
  "SkillType": "AITranslation",
  "SkillParams": "{\"TranslationConfig\":{\"SourceLanguage\":\"zh\",\"TargetLanguage\":\"en\"}}"
}
```

**视频翻译完整参数**:
```json
{
  "TranslationConfig": {
    "SourceLanguage": "zh",
    "TargetLanguage": "en",
    "TranslationTypeList": ["SubtitleTranslation", "VoiceTranslation"]
  },
  "OperatorConfig": {
    "SubtitleRecognitionConfig": {
      "RecognitionType": "ASR"
    }
  },
  "SubtitleConfig": {
    "IsHardSubtitle": true,
    "IsEraseSource": false,
    "FontSize": 24,
    "MarginV": 0.1
  }
}
```

**高光剪辑完整参数**:
```json
{
  "HighlightCuts": {
    "MinDuration": 60,
    "MaxDuration": 180
  },
  "OpeningHook": {
    "WithOpeningHook": true
  }
}
```

---

## 四、前端API接口

### 4.1 ASR接口

**POST** `/api/ai/asr`

请求:
```json
{
  "url": "视频URL"
}
```

响应:
```json
{
  "detectedNiche": "工业制品",
  "transcript": "逐字稿内容..."
}
```

---

### 4.2 脚本仿写接口

**POST** `/api/ai/rewrite`

请求:
```json
{
  "transcript": "逐字稿",
  "productInfo": "产品信息",
  "anchorStyle": "出镜人风格"
}
```

响应:
```json
{
  "hook": "开场钩子",
  "cta": "行动号召",
  "scenes": [...]
}
```

---

### 4.3 VOD上传凭证接口

**POST** `/api/vod/apply-upload`

请求:
```json
{
  "spaceName": "spacegpn4h0",
  "fileType": "video"
}
```

响应:
```json
{
  "Result": {
    "Data": {
      "UploadAddress": {
        "UploadHosts": ["tob-upload-x-d.volcvod.com"],
        "StoreInfos": [...],
        "SessionKey": "xxx"
      }
    }
  }
}
```

---

### 4.4 Aideo Agent提交接口

**POST** `/api/aideo/submit`

请求:
```json
{
  "vid": "视频ID",
  "skillType": "AITranslation",
  "skillParams": {...}
}
```

响应:
```json
{
  "success": true,
  "data": {...}
}
```

---

### 4.5 Aideo Agent查询接口

**GET** `/api/aideo/result/:taskId`

响应:
```json
{
  "Status": "Completed",
  "ApiResponses": [...]
}
```

---

## 五、配置文件说明

### 5.1 .env配置

```env
# 火山引擎配置
PORT=3000
NODE_ENV=development

# AI MediaKit
MEDIAKIT_API_KEY=your-mediakit-api-key
MEDIAKIT_BASE_URL=https://mediakit.cn-beijing.volces.com/api/v1

# ARK API (火山方舟大模型)
ARK_API_KEY=your-ark-api-key
ARK_MODEL=doubao-pro-32k
ARK_BASE_URL=https://amk-ark.cn-beijing.volces.com/api/v1

# TOS存储
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_REGION=cn-beijing
TOS_BUCKET=aimediakit
TOS_PUBLIC_BASE_URL=https://aimediakit.tos-cn-beijing.volces.com

# VOD配置
VOD_SPACE_NAME=spacegpn4h0

# 火山引擎凭证
VOLC_ACCESS_KEY_ID=your-volc-access-key-id
VOLC_SECRET_ACCESS_KEY=your-volc-secret-access-key
```

---

## 六、开发进度

### 6.1 已完成

| 功能 | 状态 | 说明 |
|------|------|------|
| 前端框架 | ✅ | React + Vite |
| ASR接口 | ✅ | MediaKit调用成功 |
| 脚本仿写 | ✅ | ARK调用成功 |
| TOS存储 | ✅ | 视频上传下载 |
| VOD SDK | ✅ | @volcengine/openapi调通 |
| Aideo Agent | ✅ | SDK调通，待集成前端 |

### 6.2 待完成

| 功能 | 优先级 | 说明 |
|------|--------|------|
| VOD上传流程 | 高 | 前端上传 → VOD → 获取Vid |
| Aideo Agent前端 | 高 | 集成到前端页面 |
| 视频生成 | 中 | 接入即梦/可灵API |
| 任务队列 | 低 | 异步任务处理 |

---

## 七、开发注意事项

### 7.1 VOD SDK使用

```javascript
// 必须用CommonJS方式导入
const { defaultService } = require('@volcengine/openapi').vodOpenapi;

// 设置凭证
defaultService.setAccessKeyId(process.env.VOLC_ACCESS_KEY_ID);
defaultService.setSecretKey(process.env.VOLC_SECRET_ACCESS_KEY);
defaultService.setRegion('cn-beijing');

// 调用API
const result = await defaultService.ApplyUploadInfo({...});
```

### 7.2 签名问题

**不要手写签名算法！** 直接用 `@volcengine/openapi` SDK，它会自动处理签名。

### 7.3 VE CLI用途

VE CLI (`C:\Users\Administrator\Downloads\ve.exe`) 仅用于：
- 测试API连通性
- 验证AK/SK是否有效
- 不要用于生产环境

---

## 八、后续开发计划

### 8.1 短期（1-2天）

1. **完成VOD上传流程**
   - 前端选择文件 → 获取上传凭证 → 上传到VOD → 确认上传 → 获取Vid

2. **集成Aideo Agent到前端**
   - 视频翻译功能
   - 高光剪辑功能

### 8.2 中期（1周）

1. **视频生成功能**
   - 接入即梦/可灵API
   - 图片+脚本 → 生成视频

2. **任务队列**
   - 异步任务处理
   - 任务状态查询

### 8.3 长期

1. **B功能完善**
   - 中文视频 → 英文视频
   - 字幕+配音+口型

2. **多语言支持**
   - 支持更多语言对

---

## 九、常见问题

### Q1: VOD API签名失败怎么办？

**A**: 不要手写签名，用 `@volcengine/openapi` SDK，它会自动处理签名。

### Q2: VE CLI能用于生产环境吗？

**A**: 不能。VE CLI只是调试工具，生产环境必须用代码实现。

### Q3: 如何获取视频ID（Vid）？

**A**: 通过VOD上传流程：
1. ApplyUploadInfo 获取上传凭证
2. 上传文件到VOD
3. CommitUploadInfo 确认上传
4. 返回的Vid就是视频ID

---

## 十、联系方式

- 项目路径: `E:\ai视频工作台`
- 前端地址: http://127.0.0.1:3000
- VOD空间: spacegpn4h0

---

**文档维护**: AI助手  
**最后更新**: 2026-05-26
