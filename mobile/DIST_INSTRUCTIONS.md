打包与分发说明（APK / IPA）

准备工作（只需做一次）：

1. 安装并登录 Expo / EAS：

```bash
npm install -g expo-cli eas-cli
expo login           # 使用你的 Expo 账号
eas login            # 使用相同账号
```

2. 在 `chat_app/mobile` 中，安装依赖：

```bash
cd chat_app/mobile
npm install
```

通过 EAS 构建（推荐，云端生成二进制）：

```bash
cd chat_app/mobile
eas build --platform android --profile production
```

或构建 iOS：

```bash
eas build --platform ios --profile production
```

构建完成后，EAS 会给出下载链接；你也可以运行：

```bash
eas build:list
eas build:download --id <BUILD_ID>
```

本地快速生成（仅用于调试，需原生环境）：

- Android（需要 Android SDK 与 Android Studio）：

```bash
cd chat_app/mobile
expo run:android
```

- iOS（macOS，需 Xcode）：

```bash
cd chat_app/mobile
expo run:ios
```

若你希望我代为构建并把 APK/IPA 上传为可下载文件：
- 我需要你临时提供一个 Expo 账号的登录方式（或在此环境中运行 `eas login`），或把你的 Expo 构建凭证提供给我授权使用（注意安全并在会话结束后撤销凭证）。

安全与注意事项：
- iOS 构建需要 Apple 开发者账号与证书（EAS 会引导你配置）。
- 生成的 APK/IPA 包含你的 `android.package` / `ios.bundleIdentifier`，请根据发布需求修改。
- 若你需要公开分发，建议在 EAS 构建后将 APK 上传到 Google Play 或使用 TestFlight 发布 iOS。 
 
GitHub CI 自动构建（使用 EAS + GitHub Actions）

1) 把项目推到你的 GitHub 仓库（例如 `origin` 的 `main` 分支）：

```bash
cd chat_app
git init
git add .
git commit -m "initial chat app"
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

2) 在 GitHub 仓库中设置 `Secrets`：
	- `EXPO_TOKEN`：Expo / EAS 的访问 token（可用 `eas login --token` 或 `expo token:download` 获得）。

3) 我已在仓库中添加 GitHub Actions 工作流：`.github/workflows/eas-build.yml`。当你推到 `main` 分支或手动触发 workflow 时，CI 会自动运行并在 EAS 上开始构建。

4) 构建完成后，EAS 会在构建详情页面提供下载链接；你也可以在 Actions 日志中看到构建输出与链接。

如果你愿意，我可以代为触发构建（需要你把仓库推到 GitHub 并把 `EXPO_TOKEN` 放进仓库 Secrets），然后把构建进度和下载链接发给你。
