移动端 (Expo)

快速运行：

1. 安装依赖：

```bash
cd chat_app/mobile
npm install
```

2. 启动 Expo：

```bash
npm start
```

在模拟器或真机上打开。

注意：开发时请确保后端在 `http://localhost:4000` 上运行，或修改 `App.js` 中的 `SERVER` 地址为后端 IP。

媒体支持：
- 本项目集成了图片选择、文件选择与上传功能，使用 `expo-image-picker` 和 `expo-document-picker`。
- 运行前请安装额外依赖（在 `chat_app/mobile` 目录下执行）：

```bash
npm install expo-image-picker expo-document-picker expo-av
```

开发时如果在真机上测试，请把 `SERVER` 设置为后端所在机器的局域网 IP，例如 `http://192.168.1.5:4000`，并确保后端可访问。

上传文件通过 `/upload` 路径托管，消息中的媒体 `content` 字段会包含完整可访问 URL（例如 `http://.../uploads/xxx.jpg`）。

打包与发布（建议使用 EAS Build）：

1) 安装并登录 Expo CLI：

```bash
npm install -g expo-cli
expo login
```

2) 安装 EAS CLI 并初始化：

```bash
npm install -g eas-cli
cd chat_app/mobile
eas build:configure
```

3) 本地开发与测试：

```bash
cd chat_app/mobile
npm install
npm start            # 然后用 Expo Go 扫码或在模拟器运行
```

4) 构建 Android / iOS（使用 EAS）：

```bash
eas build --platform android
eas build --platform ios
```

注意：EAS 需要使用 Expo 账户并在首次构建时配置凭证（文档会引导你）。如果不使用 EAS，也可以使用 `expo run:android` / `expo run:ios` 在本机生成构建（需要原生环境）。


音频支持：
- 使用 `expo-av` 提供录音与播放能力（项目已包含）。
- 在聊天界面点击“语音”开始录制，再次点击“停止录音”结束并上传，发送后对方可点击“播放语音”回放。
