# 出海AI视频工作台 - 前端文档

**版本**: v2.0  
**更新时间**: 2026-05-26  
**前端地址**: http://127.0.0.1:3000

---

## 一、页面结构

### 1.1 导航栏

| 页面 | 路径 | 功能 |
|------|------|------|
| 看板首页 | `/` | 任务看板，显示所有任务状态 |
| TK视频仿写 | `/a/step1` | A功能：对标视频 → 逐字稿 → 脚本仿写 |
| 中文转英文 | `/b` | B功能：中文视频 → 英文视频 |
| Aideo Agent | `/aideo` | C功能：AI视频处理（翻译/高光/理解） |
| 交付历史 | `/history` | 已完成的任务列表 |
| 个人中心 | `/profile` | 用户信息和积分 |

---

## 二、A功能：TK视频仿写

### 2.1 流程

```
Step1: 输入对标视频链接
    ↓
Step2: ASR提取逐字稿 + 脚本仿写
    ↓
Step3: 上传素材 + 生成视频
```

### 2.2 Step1 - 提取逐字稿

**页面**: `/a/step1`

**功能**:
- 输入TK/TikTok视频链接
- 调用ASR接口提取逐字稿
- 显示逐字稿内容

**API调用**:
```javascript
// POST /api/ai/asr
{
  "url": "https://www.tiktok.com/..."
}

// 响应
{
  "transcript": "逐字稿内容...",
  "detectedNiche": "工业制品"
}
```

### 2.3 Step2 - 脚本仿写

**页面**: `/a/step2`

**功能**:
- 显示Step1的逐字稿
- 输入产品信息、出镜人风格
- 调用ARK大模型仿写脚本
- 显示仿写结果（hook、cta、scenes）

**API调用**:
```javascript
// POST /api/ai/rewrite
{
  "transcript": "逐字稿",
  "productInfo": "全自动包装机，高速高效",
  "anchorStyle": "热情专业的工厂销售"
}

// 响应
{
  "hook": "Stop paying middleman markups!",
  "cta": "WhatsApp us today!",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "Close-up shot presenting the product",
      "voiceover": "Stop throwing money away!",
      "duration": 5
    }
  ]
}
```

### 2.4 Step3 - 视频生成

**页面**: `/a/step3`

**功能**:
- 显示仿写脚本
- 上传图片/视频素材
- 调用视频生成API
- 预览和下载生成的视频

**待接入**:
- 即梦API
- 可灵API
- 或Aideo Agent的VCreative技能

---

## 三、B功能：中文转英文

### 3.1 页面

**页面**: `/b`

### 3.2 功能

- 上传中文口播视频
- 选择目标语言（英文/日文/韩文）
- 调用Aideo Agent进行视频翻译
- 预览翻译后的视频

### 3.3 API调用

```javascript
// POST /api/aideo/submit
{
  "vid": "视频ID",
  "skillType": "AITranslation",
  "skillParams": {
    "TranslationConfig": {
      "SourceLanguage": "zh",
      "TargetLanguage": "en",
      "TranslationTypeList": ["SubtitleTranslation", "VoiceTranslation"]
    },
    "SubtitleConfig": {
      "IsHardSubtitle": true,
      "FontSize": 24
    }
  }
}
```

---

## 四、C功能：Aideo Agent

### 4.1 页面

**页面**: `/aideo`

### 4.2 支持的技能

| 技能 | SkillType | 功能 |
|------|-----------|------|
| AI视频翻译 | AITranslation | 字幕+配音+口型对齐 |
| 高光智剪 | Highlight | 自动生成1-3分钟集锦 |
| 视频理解 | Vision | 多模态大模型分析 |
| 创意视频 | VCreative | 图片转视频、视频拼接 |

### 4.3 视频翻译

**输入**:
- 视频ID（Vid）
- 源语言
- 目标语言
- 翻译类型（字幕/语音）

**API调用**:
```javascript
// POST /api/aideo/submit
{
  "vid": "xxx",
  "skillType": "AITranslation",
  "skillParams": {
    "TranslationConfig": {
      "SourceLanguage": "zh",
      "TargetLanguage": "en",
      "TranslationTypeList": ["SubtitleTranslation", "VoiceTranslation"]
    }
  }
}
```

### 4.4 高光剪辑

**输入**:
- 视频ID（Vid）
- 最小时长（秒）
- 最大时长（秒）

**API调用**:
```javascript
// POST /api/aideo/submit
{
  "vid": "xxx",
  "skillType": "Highlight",
  "skillParams": {
    "HighlightCuts": {
      "MinDuration": 60,
      "MaxDuration": 180
    },
    "OpeningHook": {
      "WithOpeningHook": true
    }
  }
}
```

### 4.5 视频理解

**输入**:
- 视频ID（Vid）
- 分析提示词

**API调用**:
```javascript
// POST /api/aideo/submit
{
  "vid": "xxx",
  "skillType": "Vision",
  "skillParams": {
    "Prompt": "请分析这个视频的内容..."
  }
}
```

### 4.6 创意视频

**输入**:
- 图片Mid列表
- 创意描述

**API调用**:
```javascript
// POST /api/aideo/submit
{
  "skillType": "VCreative",
  "inputs": [
    {"Type": "Vid", "Vid": "mid1"},
    {"Type": "Vid", "Vid": "mid2"}
  ],
  "skillParams": {
    "Text": "将图片1、2拼接为10秒视频"
  }
}
```

### 4.7 任务查询

**API调用**:
```javascript
// GET /api/aideo/result/:taskId

// 响应
{
  "Status": "Completed",
  "ApiResponses": [
    {
      "VodTaskType": "AITranslation",
      "Status": "Success",
      "Output": {...}
    }
  ]
}
```

---

## 五、API接口汇总

### 5.1 ASR接口

**POST** `/api/ai/asr`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 视频URL |

---

### 5.2 脚本仿写接口

**POST** `/api/ai/rewrite`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| transcript | string | 是 | 逐字稿 |
| productInfo | string | 否 | 产品信息 |
| anchorStyle | string | 否 | 出镜人风格 |

---

### 5.3 VOD上传凭证接口

**POST** `/api/vod/apply-upload`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| spaceName | string | 否 | VOD空间名，默认spacegpn4h0 |
| fileType | string | 否 | 文件类型，默认video |

---

### 5.4 Aideo Agent提交接口

**POST** `/api/aideo/submit`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vid | string | 否 | 视频ID |
| skillType | string | 是 | 技能类型 |
| skillParams | object | 否 | 技能参数 |
| prompt | string | 否 | 自然语言指令 |

---

### 5.5 Aideo Agent查询接口

**GET** `/api/aideo/result/:taskId`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| taskId | string | 是 | 任务ID |

---

## 六、组件说明

### 6.1 AideoAgent组件

**路径**: `src/components/AideoAgent.tsx`

**功能**: Aideo Agent页面，支持4种AI技能

**状态**:
```typescript
const [selectedSkill, setSelectedSkill] = useState('translate');
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [vid, setVid] = useState('');
```

---

## 七、样式规范

### 7.1 颜色

- 主色调: `#3B82F6` (蓝色)
- 背景色: `#0F172A` (深蓝)
- 文字色: `#E2E8F0` (浅灰)

### 7.2 组件样式

```css
/* 卡片 */
.card {
  background: #1E293B;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
}

/* 按钮 */
.btn-primary {
  background: #3B82F6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

---

## 八、开发注意事项

### 8.1 API调用

- 所有API调用使用 `fetch`
- 错误处理使用 `try-catch`
- 加载状态使用 `loading` 变量

### 8.2 状态管理

- 使用 React Hooks (useState, useEffect)
- 页面状态通过 props 传递

### 8.3 样式

- 使用 TailwindCSS
- 遵循暗色主题规范

---

**文档维护**: AI助手  
**最后更新**: 2026-05-26