export type TaskStatus = 'pending' | 'processing' | 'completed';
export type TaskType = 'A' | 'B'; // A: 智能视频工作台, B: 数字人视频处理

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  
  // A 功能: TK 视频仿写相关
  tiktokUrl?: string;
  transcript?: string;         // A-Step1 / B-分离逐字稿
  productInfo?: string;        // A-Step2 输入
  anchorStyle?: string;        // A-Step2 播主风格描述
  rewrittenScript?: string;    // A-Step2 / B-翻译仿写脚本
  
  // B 功能: 中文转英文
  videoFileName?: string;
  clonedVoice?: string;        // 克隆配音选项
  
  // 最终生成视频
  generatedVideoUrl?: string;
  mediaAssets?: string[];

  // 翻译任务
  projectId?: string;
}
