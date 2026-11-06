# 代码规范

## 1. 命名规则

### 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `Step1Transcript.tsx`, `KanbanBoard.tsx` |
| 服务文件 | kebab-case.ts | `douyin-downloader.ts`, `api-service.ts` |
| 工具文件 | kebab-case.ts | `format-utils.ts` |
| 类型文件 | kebab-case.ts | `types.ts` |
| 样式文件 | kebab-case.css | `index.css` |
| 配置文件 | kebab-case.config.ts | `vite.config.ts` |

### 代码命名

| 类型 | 规则 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `Step1Transcript`, `KanbanBoard` |
| 函数/方法 | camelCase | `handleExtract`, `fetchTranscription` |
| 常量 | UPPER_SNAKE_CASE | `MEDIAKIT_API_KEY`, `VOD_SPACE_NAME` |
| 类型/接口 | PascalCase | `Task`, `TaskStatus`, `ScriptData` |
| 变量 | camelCase | `userCredits`, `wizardStep` |
| CSS 类 | TailwindCSS 原子类 | `bg-blue-600`, `text-white` |

### Props 命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 回调 props | on + 动词 | `onProceed`, `onBack`, `onAddTask` |
| 状态 props | 直接命名 | `userCredits`, `loading` |
| 设置函数 | set + 名称 | `setUserCredits`, `setLoading` |

## 2. 组件规则

### 组件结构

```typescript
// 1. imports
import React, { useState } from 'react';
import { Icon } from 'lucide-react';

// 2. interface/type
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 3. 常量（组件外部）
const PRESET_DATA = [...];

// 4. 组件导出
export default function MyComponent({ title, onAction }: MyComponentProps) {
  // 4a. hooks
  const [state, setState] = useState('');

  // 4b. handlers
  const handleClick = () => { ... };

  // 4c. render
  return (
    <div>...</div>
  );
}
```

### 组件拆分原则

- 单个组件不超过 300 行
- 超过 80 行的逻辑应提取为自定义 hooks 或工具函数
- 页面级组件放在 `src/pages/`（重构后）
- 可复用组件放在 `src/components/`
- 业务逻辑 hooks 放在 `src/hooks/`

### 现有组件职责

| 组件 | 职责 | 行数 |
|------|------|------|
| App.tsx | 主页面（路由+状态+业务逻辑） | ~730（过大） |
| Step1Transcript | A功能-提取逐字稿 | ~327 |
| Step2Script | A功能-脚本仿写 | ~422 |
| Step3Video | A功能-视频生成 | ~401 |
| ChineseToEnglish | B功能-中文转英文 | ~437 |
| AideoAgent | Aideo Agent页面 | ~594 |
| KanbanBoard | 任务看板 | ~191 |
| TaskHistory | 任务历史 | ~188 |
| UserProfile | 用户中心 | ~227 |
| VideoModal | 视频弹窗 | ~158 |
| StepIndicator | 步骤指示器 | ~62 |

## 3. 样式规则

### TailwindCSS 使用

- 使用 TailwindCSS 4.x 原子类
- 暗色主题为主，不使用 light 模式
- 颜色使用项目约定的色板：

```
主色：blue-600 (#3B82F6)
辅色：purple-600 (#8B5CF6)
成功：emerald-500 (#10B981)
警告：amber-500 (#F59E0B)
错误：red-400 (#F87171)
背景：slate-900 (#0F172A), slate-800 (#1E293B)
边框：slate-700 (#334155)
文字：slate-100 (#F1F5F9), slate-400 (#94A3B8)
```

### 响应式断点

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

## 4. API 调用规则

### 前端调用

```typescript
// 统一使用 try-catch 处理异常
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/xxx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ... })
    });
    if (!response.ok) throw new Error('请求失败');
    const data = await response.json();
    // 处理数据
  } catch (err: any) {
    setErrorMsg(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 后端调用

```typescript
// 路由处理统一格式
app.post('/api/xxx', async (req, res) => {
  console.log(`[API] /api/xxx`);
  try {
    const result = await someService(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('[API] Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## 5. 错误处理规则

### 前端错误

- 使用 `errorMsg` 状态存储错误信息
- 错误信息使用红色 AlertCircle 组件展示
- 积分不足使用专门的错误码格式：`[错误码: E004]`
- 网络错误使用兜底 mock 数据

### 后端错误

- 使用 console.error 记录错误
- 返回 `{ error: message }` 格式
- HTTP 状态码：400（参数错误）、404（未找到）、500（服务器错误）

## 6. 积分系统规则

- 每次 API 调用前检查积分是否充足
- 积分消耗在前端组件中执行（setUserCredits）
- 积分不足时显示专门的错误提示

| 操作 | 消耗 |
|------|------|
| ASR | 10 |
| 仿写 | 5 |
| 翻译 | 20 |
| 合成 | 50 |

## 7. 禁止事项

- 不允许引入未经确认的第三方依赖
- 不允许在组件中硬编码 API Key
- 不允许删除已有功能代码（重构时移动而非删除）
- 不允许修改已有的接口字段命名（除非同步更新文档）
- 不允许使用 `any` 类型（除非有充分理由并添加注释）
- 不允许在同一个文件中定义多个组件
- 不允许在组件中直接调用外部 API（应通过 services 层）
