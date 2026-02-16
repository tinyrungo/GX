#!/bin/bash
set -e
echo "演示脚本：显示如何启动后端并用 curl 测试注册/登录/上传（脚本仅打印命令，不会自动启动服务）。"
echo
echo "# 后端启动（开发）"
echo "cd chat_app/backend"
echo "npm install"
echo "node index.js"
echo
echo "# 注册用户"
echo "curl -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"alice\",\"password\":\"secret\",\"displayName\":\"Alice\"}'"
echo
echo "# 登录获取 token"
echo "curl -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"alice\",\"password\":\"secret\"}'"
echo
echo "# 上传文件（替换 path/to/file）"
echo "curl -X POST http://localhost:4000/upload -F \"file=@path/to/file.jpg\""
echo
echo "# 发送文本消息（在客户端使用 socket.io 更方便），或使用 messages API"
echo "curl -X POST http://localhost:4000/messages -H 'Content-Type: application/json' -d '{\"fromId\":1,\"toId\":2,\"content\":\"你好\",\"type\":\"text\"}'"
echo
echo "--- 上述命令为演示示例；请在终端分别执行它们来验证功能。"
