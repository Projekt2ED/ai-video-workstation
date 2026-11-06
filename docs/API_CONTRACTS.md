# 接口与字段文档

## 一、核心类型定义

### Task

```typescript
type TaskStatus = 'pending' | 'processing' | 'to_confirm' | 'completed';
type TaskType = 'A' | 'B';

interface Task {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  createdAt: string;

  // A功能: TK视频仿写
  tiktokUrl?: string;
  transcript?: string;
  productInfo?: string;
  anchorStyle?: string;
  rewrittenScript?: string;

  // B功能: 中文转英文
  videoFileName?: string;
  clonedVoice?: string;

  // 通用
  generatedVideoUrl?: string;
  mediaAssets?: string[];
}
```

### ScriptData（脚本仿写结果）

```typescript
interface ScriptData {
  hook: string;       // 开场钩子
  cta: string;        // 行动号召
  scenes: Scene[];
}

interface Scene {
  sceneNumber: number;
  visual: string;     // 画面描述
  voiceover: string;  // 台词
  duration: number;   // 秒数
}
```

### TranslationResult（翻译结果）

```typescript
interface TranslationResult {
  englishTitle: string;
  originalTranscript: string;
  translatedTranscript: string;
  voiceCloneProfile: string;
  scenes: Scene[];
}
```

### AideoResult（Aideo Agent结果）

```typescript
interface AideoResult {
  success?: boolean;
  runId?: string;
  taskId?: string;
  error?: string;
  Status?: string;
  ApiResponses?: AideoApiResponse[];
}

interface AideoApiResponse {
  VodTaskType: string;
  Status: string;
  Output: Record<string, any>;
}
```

### PagePath

```typescript
type PagePath = '/' | '/a/step1' | '/a/step2' | '/a/step3' | '/b' | '/history' | '/profile' | '/aideo';
```

---

## 二、后端 API 接口

### 2.1 任务管理

#### GET /api/tasks

获取所有任务列表。

**响应**:
```json
{
  "tasks": [Task]
}
```

#### POST /api/tasks

创建新任务。

**请求**:
```json
{
  "name": "任务名称",
  "type": "A",
  "tiktokUrl": "https://www.tiktok.com/...",
  "videoFileName": "video.mp4"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 任务名称 |
| type | 'A' \| 'B' | 是 | 任务类型 |
| tiktokUrl | string | 否 | A功能的TK链接 |
| videoFileName | string | 否 | B功能的视频文件名 |

**响应**:
```json
{
  "success": true,
  "task": Task
}
```

#### POST /api/tasks/update

更新任务状态。

**请求**:
```json
{
  "id": "task-xxx",
  "status": "completed",
  "progress": 100,
  "transcript": "逐字稿内容",
  "rewrittenScript": "{\"hook\":\"...\",\"cta\":\"...\",\"scenes\":[...]}",
  "generatedVideoUrl": "https://..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 任务ID |
| status | TaskStatus | 否 | 新状态 |
| progress | number | 否 | 进度 0-100 |
| transcript | string | 否 | 逐字稿 |
| rewrittenScript | string | 否 | 脚本JSON字符串 |
| generatedVideoUrl | string | 否 | 生成的视频URL |

**响应**:
```json
{
  "success": true,
  "task": Task
}
```

#### POST /api/tasks/simulate-run

模拟任务运行（开发测试用）。

**请求**:
```json
{
  "id": "task-xxx",
  "targetStatus": "to_confirm"
}
```

**响应**:
```json
{
  "success": true,
  "task": Task
}
```

#### DELETE /api/tasks/:id

删除任务。

**响应**:
```json
{
  "success": true
}
```

---

### 2.2 AI 接口

#### POST /api/ai/asr

ASR语音识别，提取视频逐字稿。

**请求**:
```json
{
  "url": "视频URL",
  "title": "视频标题（可选）"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 视频URL |
| title | string | 否 | 辅助标题 |

**响应**:
```json
{
  "detectedNiche": "工业制品",
  "mockTitle": "AI提取 - 工业制品",
  "transcript": "逐字稿内容..."
}
```

**调用链路**: 前端 → Express → MediaKit ASR API → 轮询结果

---

#### POST /api/ai/rewrite

脚本仿写，根据逐字稿生成新脚本。

**请求**:
```json
{
  "transcript": "原始逐字稿",
  "productInfo": "产品信息（可选）",
  "anchorStyle": "出镜人风格（可选）"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| transcript | string | 是 | 原始视频逐字稿 |
| productInfo | string | 否 | 产品信息，默认有兜底值 |
| anchorStyle | string | 否 | 出镜人风格描述 |

**响应**（ScriptData）:
```json
{
  "hook": "开场钩子文本",
  "cta": "行动号召文本",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "画面描述",
      "voiceover": "英文台词",
      "duration": 5
    }
  ]
}
```

**调用链路**: 前端 → Express → ARK LLM (doubao-pro-32k)

---

#### POST /api/ai/translate

翻译，将中文内容翻译为英文脚本。

**请求**:
```json
{
  "originalContent": "中文口播内容",
  "clonedVoice": "配音名称"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| originalContent | string | 是 | 中文口播内容 |
| clonedVoice | string | 否 | 配音克隆音色名称 |

**响应**:
```json
{
  "englishTitle": "英文标题",
  "translatedTranscript": "翻译后的英文脚本",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "画面描述",
      "voiceover": "英文台词",
      "duration": 5
    }
  ]
}
```

---

### 2.3 VOD 接口

#### POST /api/vod/apply-upload

获取VOD上传凭证。

**请求**:
```json
{
  "spaceName": "spacegpn4h0",
  "fileType": "video"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| spaceName | string | 否 | VOD空间名，默认 spacegpn4h0 |
| fileType | string | 否 | 文件类型，默认 video |

**响应**（VOD SDK 原始格式）:
```json
{
  "Result": {
    "Data": {
      "UploadAddress": {
        "UploadHosts": ["tob-upload-x-d.volcvod.com"],
        "StoreInfos": [
          {
            "StoreUri": "tos-vod-xxx/xxx",
            "Auth": "xxx"
          }
        ],
        "SessionKey": "xxx"
      }
    }
  }
}
```

#### POST /api/vod/commit-upload

确认VOD上传。

**请求**:
```json
{
  "spaceName": "spacegpn4h0",
  "sessionKey": "xxx",
  "functions": []
}
```

#### POST /api/vod/media-info

获取VOD媒体信息。

**请求**:
```json
{
  "spaceName": "spacegpn4h0",
  "vid": "视频ID"
}
```

---

### 2.4 Aideo Agent 接口

#### POST /api/aideo/translate

视频翻译（使用VE CLI调用）。

**请求**:
```json
{
  "vid": "视频ID",
  "sourceLang": "zh",
  "targetLang": "en"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vid | string | 是 | VOD视频ID |
| sourceLang | string | 否 | 源语言，默认 zh |
| targetLang | string | 否 | 目标语言，默认 en |

**响应**:
```json
{
  "success": true,
  "data": { ... }
}
```

#### GET /api/aideo/result/:taskId

查询Aideo Agent任务结果。

**响应**（VE CLI 原始格式）:
```json
{
  "Status": "Completed",
  "ApiResponses": [
    {
      "VodTaskType": "AITranslation",
      "Status": "Success",
      "Output": { ... }
    }
  ]
}
```

---

## 三、前端组件 Props

### Step1Transcript

```typescript
interface Step1TranscriptProps {
  initialUrl?: string;
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
  onProceed: (transcript: string, videoUrl: string) => void;
}
```

### Step2Script

```typescript
interface Step2ScriptProps {
  sourceTranscript: string;
  sourceUrl: string;
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
  onProceed: (rewrittenScript: string, docInfo: string, style: string) => void;
  onBack: () => void;
}
```

### Step3Video

```typescript
interface Step3VideoProps {
  scriptJson: string;
  docInfo: string;
  styleLabel: string;
  sourceUrl: string;
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
  onAddTask: (taskName: string, videoUrl: string, mediaFiles: string[]) => void;
}
```

### ChineseToEnglish

```typescript
interface ChineseToEnglishProps {
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
  onAddTask: (taskName: string, videoUrl: string, translationResult: string) => void;
}
```

### KanbanBoard

```typescript
interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onSimulateRun: (taskId: string, targetStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}
```

### TaskHistory

```typescript
interface TaskHistoryProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}
```

### UserProfile

```typescript
interface UserProfileProps {
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
}
```

### VideoModal

```typescript
interface VideoModalProps {
  task: Task;
  onClose: () => void;
}
```

### StepIndicator

```typescript
interface StepIndicatorProps {
  currentStep: number;
  onNavigate?: (step: number) => void;
}
```

---

## 四、Aideo Agent 技能类型

| 技能 | SkillType | 功能 | 状态 |
|------|-----------|------|------|
| AI视频翻译 | AITranslation | 字幕+配音+口型对齐 | 已调通 |
| 高光智剪 | Highlight | 自动生成1-3分钟集锦 | 已调通 |
| 视频理解 | Vision | 多模态大模型分析 | 已调通 |
| 创意视频 | VCreative | 图片转视频、视频拼接 | 已调通 |

---

## 五、积分系统

| 操作 | 消耗积分 |
|------|----------|
| ASR 逐字稿提取 | 10 |
| LLM 脚本仿写 | 5 |
| LLM 翻译 | 20 |
| 视频合成 | 50 |

初始积分：850
充值：100 / 500（测试用）
