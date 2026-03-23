---
title: 双前端项目 Nginx (Windows) 部署方案总结
date: 2026-03-23
categories: []
tags: []
excerpt: 一、 背景 (Background)用户目标：在单台 Windows 服务器上，通过 Nginx 部署两个独立的前端项目。项目一 (projecta)： 用户自定义的主应用，包含前端和多个后端服务（主 API、SSE 服务、ASR WebSocket 服务）。项目二 (projectb，后用于 pptview)： 开源的纯前端应用。运行环境：操作系统：WindowsNginx 版本：1.22.1
---

### 一、 背景 (Background)



- **用户目标：**
- 在单台 Windows 服务器上，通过 Nginx 部署两个独立的前端项目。
- 项目一 (projecta)： 用户自定义的主应用，包含前端和多个后端服务（主 API、SSE 服务、ASR WebSocket 服务）。
- 项目二 (projectb，后用于 pptview)： 开源的纯前端应用。

- **运行环境：**
- 操作系统：Windows
- Nginx 版本：1.22.1 (安装路径 D:\develop\nginx-1.22.1\)

期望访问方式 (最终确定)：

项目一 (projecta) 作为主应用，通过根路径访问：http://localhost/

项目二 (projectb/pptview) 作为次应用，通过子路径访问：http://localhost/pptview/

Nginx 角色：

为两个前端项目提供静态文件服务。

为项目一的多个后端服务提供统一的反向代理入口。

项目初始状态：

前端项目已打包为 dist 文件夹。

项目一的后端服务具有各自独立的访问地址和端口（部分为公网IP，部分为内网IP）。

二、 主要问题与挑战 (Problems/Issues)




前端静态文件存放位置： 在 Windows Nginx 环境下，应将打包好的前端项目 dist 文件夹内容放置于何处。

Nginx 配置文件管理 (Windows)： 如何在 Windows Nginx 中组织和修改配置，以支持多项目部署（直接修改主 nginx.conf 还是使用 include 结构）。

前端项目 base URL 配置： 当项目部署在根路径 (/) 或子路径 (/pptview/) 时，前端项目自身构建配置中的 base URL（或 publicPath 等）必须正确设置，否则会导致资源加载失败（404错误）和路由错误。

前端对后端服务接口的调用路径： 如果希望所有后端请求都通过 Nginx 代理，项目一的前端代码中写死的后端服务绝对URL需要修改为指向 Nginx 代理的相对路径，并因此需要重新打包前端项目。

Nginx location 块配置：

如何为根路径 (/) 和子路径 (/pptview/) 正确配置 location，使用 alias 指令映射到正确的静态文件目录。

如何为单页面应用 (SPA) 配置 try_files 指令，以保证前端路由正常工作。

Nginx 反向代理配置：

如何为项目一的多个后端服务（HTTP API、SSE、WebSocket）配置不同的 location 块进行反向代理。

如何正确设置 proxy_pass 指令，包括目标URL末尾斜杠 / 的影响。

如何为不同类型的后端服务（特别是 SSE 和 WebSocket）设置必要的 proxy_set_header 指令（如 Upgrade, Connection, X-Accel-Buffering 等）。

厘清开发环境与生产部署差异： 用户初期提到前端项目在开发时运行的端口（如 localhost:8080），需要明确Nginx在生产部署时通常是直接提供静态 dist 文件，而非代理到前端开发服务器。

Nginx Windows 命令： 用户需要了解在 Windows 环境下如何测试 Nginx 配置、启动和重新加载服务。

三、 解决方案 (Solutions)




前端静态文件存放：




将项目一 (projecta) dist 文件夹的内容复制到 D:\develop\nginx-1.22.1\html\projecta\。

将项目二 (projectb/pptview) dist 文件夹的内容复制到 D:\develop\nginx-1.22.1\html\projectb\。

Nginx 配置文件管理：




备份原始的 D:\develop\nginx-1.22.1\conf\nginx.conf。

将下述的 server { ... } 配置块直接添加到 nginx.conf 文件中的 http { ... } 块内部。

前端项目 base URL 配置并重新打包：




项目一 (projecta)： 构建 base URL 设置为 '/'。

项目二 (projectb/pptview)： 构建 base URL 设置为 '/pptview/'。

(具体设置方法取决于前端框架，如 Vite 的 vite.config.js 中的 base 选项)。

修改后，两个前端项目都必须重新打包构建，并将新的 dist 内容部署到服务器。

项目一前端 API/服务调用地址修改并重新打包：




projecta 前端代码中对后端服务的调用地址修改为指向 Nginx 代理的相对路径：

主API (VUE_APP_BASE_URL) -> /api/

SSE服务 (VUE_APP_BASE_SSEURL) -> /sse_proxy/taskStatus (或自定义的Nginx代理路径)

ASR WebSocket服务 (VUE_APP_WS_URL) -> ws://localhost/ws_proxy/ (或自定义的Nginx代理路径，localhost为访问Nginx的地址)

修改后，projecta 必须重新打包构建。

Nginx 核心配置 (server 块)：




文件路径： D:\develop\nginx-1.22.1\conf\nginx.conf (在 http {} 块内)

server {

    listen 80;

    server_name localhost; # 本地测试，或替换为实际域名/IP

 

    access_log logs/my_projects.access.log; # 日志相对于Nginx安装目录

    error_log  logs/my_projects.error.log;

 

    # --- 前端项目 A (projecta) @ http://localhost/ ---

    location / {

        alias D:/develop/nginx-1.22.1/html/projecta/;

        index index.html index.htm;

        try_files $uri $uri/ /index.html; 

    }

 

    # --- 前端项目 B (projectb/pptview) @ http://localhost/pptview/ ---

    location /pptview/ {

        alias D:/develop/nginx-1.22.1/html/projectb/;

        index index.html index.htm;

        try_files $uri $uri/ /pptview/index.html;

    }

 

    # --- 项目 A 的后端服务代理 ---

    # 1. 主要 API 服务 (前端请求 /api/...)

    location /api/ {

        proxy_pass http://8.210.23.86:8000/api/;

        proxy_set_header Host $proxy_host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;

        proxy_set_header Connection ""; 

    }

 

    # 2. SSE 服务 (前端请求 /sse_proxy/taskStatus)

    location /sse_proxy/taskStatus {

        proxy_pass http://192.168.11.217:8001/taskStatus;

        proxy_set_header Connection '';

        proxy_http_version 1.1;

        proxy_set_header X-Accel-Buffering no; 

        proxy_cache off;

        chunked_transfer_encoding off; 

    }

 

    # 3. ASR WebSocket 服务 (前端通过 ws://localhost/ws_proxy/ 连接)

    location /ws_proxy/ {

        proxy_pass http://8.210.23.86:8001/ws;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection "upgrade";

        proxy_set_header Host $proxy_host;

        proxy_read_timeout 86400s; 

        proxy_send_timeout 86400s;

    }

}




Nginx Windows 命令 (在 D:\develop\nginx-1.22.1\ 目录下执行)：




测试配置文件：nginx.exe -t

启动 Nginx：start nginx.exe (或双击 nginx.exe)

重新加载配置：nginx.exe -s reload (在 Nginx 已运行时应用新配置)

停止 Nginx：nginx.exe -s stop 或 nginx.exe -s quit

故障排除：




如遇 404 错误，首先检查浏览器开发者工具的 "Network" (网络) 标签页，确认请求的资源 URL 是否正确（是否包含正确的 base 路径前缀）。

检查 Nginx 的 error.log 和 access.log 获取详细错误信息。

确认前端项目是否已按新的 base URL 和 API 代理路径重新打包并部署。

这份文档总结了我们讨论的主要环节和最终的解决方案。核心在于正确配置 Nginx 的 location 块以服务静态文件和代理后端请求，并确保前端项目自身的构建配置（特别是 base URL 和对后端服务的请求地址）与 Nginx 配置相匹配。


