# Planets.Run 开发与部署维护文档

本文档详细说明了 `Planets.Run` 项目的开发、测试、以及**基于包压缩的直连服务器自动化部署**环境和逻辑。

---

## 1. 开发环境 (Development)

项目基于 **Next.js 16 / React 19** 构建，并开启了 `standalone` 独立部署模式，使用 **Tailwind CSS v4** 作为样式方案。

### 启动开发
```bash
npm install
npm run dev
```

---

## 2. 目前已生效的部署方式：本地直接推送压缩包

在我们的历史记录中，项目目前使用的是**最安全且最稳妥的本地 standalone 打包后推送的方案**，没有任何需要第三方介入的繁琐。全过程可以一键运行 `deploy.sh` 解决。

### 2.1 这套流程自动帮我们做了什么？（为什么服务器上能跑）
当我们执行 `deploy.sh` 脚本时：
1. **本地编译：** 在你的 Mac 上执行 `npm run build`。由于打开了 Next.js 的 output: standalone，它会抽出核心代码，把没有用到的部分全部舍弃。
2. **整理静态文件：** Next.js 的保护机制会导致缺失 `public/` 和 `.next/static/`，脚本会自动把它们拷贝进去补全。
3. **安全上云：** 脚本把最小化完整服务压缩成 `planets.tar.gz`，通过 `scp` 安全静默传送到服务器 `r`。
4. **覆盖旧系统：** 自动 SSH 进服务器后，把它解压覆盖到服务器真实运行的目录 `/var/www/planets.run` 下。
5. **服务热更：** 直接执行 `npx pm2 restart planets.run`，所以你的站点几乎没有感知就完成了新老交替。

---

## 3. 服务器上的文件位置和配置

### 3.1 Nginx 与站点位置
你之前连进服务器找不到，是因为**站点的文件没有在用户家目录，而是放在了正规的 `/var/www/` 目录下**。
- **文件到底在哪？**`/var/www/planets.run`
- **后台守护进程：**PM2 将进程名字设置为 `planets.run`，所以在服务器执行 `npx pm2 logs planets.run` 就可以看到运行情况。

### 3.2 关于 Nginx 代理与端口转发
因为是用 `server.js` 启动的 Standalone 模式，在你的 Nginx 配置下，它通常被绑定到内网端口并且向上暴露：
- **`planets_run.conf`**：把 `planets.run` 拦截并代理到后台对应的 Nodejs 端口（如 3004）。
- **`brucetrail_planets_run.conf`**：`brucetrail` 子域名默认做 301 重定向到主站点子页面。
*(这些文件如果要挂载，放在服务器的 `/etc/nginx/sites-available` 里并生效)*

---

## 4. 如何维护
- 以后更新网站，修改完你 Mac 本地代码后，直接运行终端下的 `./deploy.sh` 就什么都不用管了。
- 关于 HTTPS，使用的是 Certbot，通常通过 `sudo certbot --nginx` 配完就无需管了，可以执行 `sudo certbot renew --dry-run` 手工验证。
