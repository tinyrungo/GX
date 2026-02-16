后端 (Express + SQLite + Socket.IO)

快速运行：

```bash
cd chat_app/backend
npm install
node index.js     # 或 npm run dev (需要 nodemon)
```

API:
- POST /auth/register { username, password, displayName }
- POST /auth/login { username, password }
- GET /users
- GET /online
- POST /messages { fromId, toId, content }
- GET /messages/history/:userA/:userB

Socket.IO: 连接时在 `auth.token` 中发送 JWT，事件 `private_message` 用于私聊。

环境与部署说明：
- 环境变量：
	- `JWT_SECRET`：用于签发 JWT（生产环境务必设置强随机值，默认 `secretkey`）。
	- `ALLOWED_ORIGINS`：允许的前端来源，逗号分隔（例如 `http://localhost:19006`），默认允许所有 `*`。
	- `PORT`：后端监听端口，默认 `4000`。
- 文件上传限制：单文件大小限制为 10MB（可在 `routes/upload.js` 中调整）。

快速运行（开发）：

```bash
cd chat_app/backend
npm install
node index.js    # 或 ./start.sh
```

测试示例（使用 curl）:

1) 注册用户

```bash
curl -X POST http://localhost:4000/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"username":"alice","password":"secret","displayName":"Alice"}'
```

2) 登录获取 `token`

```bash
curl -X POST http://localhost:4000/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"username":"alice","password":"secret"}'
```

3) 上传文件（替换 `path/to/file.jpg`）

```bash
curl -X POST http://localhost:4000/upload -F "file=@path/to/file.jpg"
```

注意：Socket.IO 通信更适合即时消息（前端使用 `socket.io-client` 连接并在 `auth.token` 中传入 JWT）。

