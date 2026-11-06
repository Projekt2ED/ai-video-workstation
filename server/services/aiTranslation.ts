import { createRequire } from 'module';
import { VOD_SPACE_NAME } from '../config';

const _require = createRequire(import.meta.url);
const { defaultService: vodService } = _require('@volcengine/openapi').vodOpenapi;

vodService.setAccessKeyId(process.env.VOLC_ACCESS_KEY_ID || '');
vodService.setSecretKey(process.env.VOLC_SECRET_ACCESS_KEY || '');
vodService.setRegion('cn-north-1');

export interface TranslationOptions {
  vid: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translationTypeList: string[];
}

export async function submitTranslation(opts: TranslationOptions): Promise<{ projectId: string }> {
  const params: any = {
    SpaceName: VOD_SPACE_NAME,
    Vid: opts.vid,
    TranslationConfig: {
      SourceLanguage: opts.sourceLanguage || 'zh',
      TargetLanguage: opts.targetLanguage,
      TranslationTypeList: opts.translationTypeList,
    },
  };

  const result = await vodService.fetchOpenAPI({
    Action: 'SubmitAITranslationWorkflow',
    Version: '2025-01-01',
    method: 'POST',
    data: params,
  });

  const projectId = result?.Result?.ProjectId;
  if (!projectId) {
    throw new Error(`翻译任务创建失败: ${JSON.stringify(result).slice(0, 300)}`);
  }

  console.log(`[Translation] 任务已创建 - ProjectId: ${projectId}`);
  return { projectId };
}

export async function getTranslationStatus(projectId: string): Promise<{
  status: string;
  progress: number;
  outputVid?: string;
  outputSubtitleUrl?: string;
  error?: string;
}> {
  const result = await vodService.fetchOpenAPI({
    Action: 'GetAITranslationProject',
    Version: '2025-01-01',
    method: 'GET',
    query: {
      SpaceName: VOD_SPACE_NAME,
      ProjectId: projectId,
    },
  });

  const project = result?.Result?.Project;
  if (!project) {
    return { status: 'unknown', progress: 0, error: '查询不到项目信息' };
  }

  const status = project.Status || 'unknown';
  const progress = status === 'Completed' ? 100 : status === 'Failed' ? 0 : (project.Progress || 50);

  return {
    status,
    progress,
    outputVid: project.OutputVid || undefined,
    outputSubtitleUrl: project.OutputSubtitle?.Url || undefined,
    error: status === 'Failed' ? (project.ErrorMessage || '翻译失败') : undefined,
  };
}

export async function listTranslationProjects(vid?: string): Promise<any[]> {
  const query: any = { SpaceName: VOD_SPACE_NAME };
  if (vid) query.Vid = vid;

  const result = await vodService.fetchOpenAPI({
    Action: 'ListAITranslationProject',
    Version: '2025-01-01',
    method: 'GET',
    query,
  });

  return result?.Result?.Projects || [];
}
