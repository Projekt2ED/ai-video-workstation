# API 密钥获取指南

## 需要获取/更新的密钥

### 1. MediaKit API Key（ASR 语音识别）

**配置项**：`MEDIAKIT_API_KEY`

**获取步骤**：
1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入 **智能语音** → **语音识别**
3. 开通服务 → 创建应用
4. 获取 **Access Token**
5. 填入 `.env` 文件的 `MEDIAKIT_API_KEY`

---

### 2. 火山引擎访问密钥（AccessKey）

**配置项**：
- `VOLC_ACCESS_KEY_ID`
- `VOLC_SECRET_ACCESS_KEY`

**获取步骤**：
1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 点击右上角头像 → **API 访问密钥**
3. 点击 **新建密钥**
4. 复制 `AccessKey ID` 和 `Secret Access Key`
5. 分别填入 `.env` 文件

**注意**：Secret Key 只显示一次，请妥善保管

---

## 已有配置（无需更新）

| 配置项 | 当前值 |
|--------|--------|
| ARK_API_KEY | 已配置 |
| ARK_MODEL | doubao-pro-32k |
| VOD_SPACE_NAME | spacegpn4h0 |

---

## 配置完成后

1. 替换 `.env` 中的 `替换为你的xxx`
2. 重启服务：`npm run dev`
3. 验证连通性：参考 [API 连通性测试](#验证命令)

## 验证命令

```powershell
# 测试 MediaKit
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/asr" -Method POST -ContentType "application/json" -Body '{"videoUrl":"https://example.com/test.mp4"}'

# 测试 VOD
Invoke-WebRequest -Uri "http://localhost:3000/api/vod/apply-upload" -Method POST -ContentType "application/json" -Body '{"fileType":"video"}'
```
