import { createRequire } from 'module';

const _require = createRequire(import.meta.url);

let _vodService: any = null;

export function getVodService(): any {
  if (!_vodService) {
    const { defaultService } = _require('@volcengine/openapi').vodOpenapi;
    defaultService.setAccessKeyId(process.env.VOLC_ACCESS_KEY_ID || '');
    defaultService.setSecretKey(process.env.VOLC_SECRET_ACCESS_KEY || '');
    defaultService.setRegion('cn-north-1');
    _vodService = defaultService;
  }
  return _vodService;
}
