# Mini Fiber

基于 Fiber 架构的迷你 React 实现，使用 SWC 编译 JSX，Deno 管理依赖。

![alt text](screenshots/image.png)

## 前置要求

- [Deno](https://deno.land/) >= 1.40

## 快速启动

```bash
# 1. 安装依赖
deno install

# 2. 构建 + 启动开发服务器
deno task dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可看到页面。

## 可用命令

| 命令              | 说明                                  |
| ----------------- | ------------------------------------- |
| `deno install`    | 安装项目依赖（含 @swc/core）          |
| `deno task build` | 使用 SWC 编译 JSX 文件                |
| `deno task dev`   | 构建并启动本地文件服务器（端口 3000） |

## 项目结构

```
mini-fiber/
├── App.jsx              # JSX 入口组件
├── App.compiled.js      # SWC 编译产物（自动生成）
├── index.js             # 浏览器入口，调用 render
├── index.html           # HTML 页面
├── .swcrc               # SWC 配置（JSX → createElement）
├── scripts/
│   └── build.js         # 构建脚本
└── package/react/src/
    ├── fiber.js          # Fiber 核心实现
    ├── hooks.js          # Hooks（待实现）
    └── schedular.js      # 调度器（待实现）
```

## 工作原理

1. **SWC** 将 `App.jsx` 中的 JSX 语法编译为 `createElement()` 调用
2. **fiber.js** 实现了 Fiber 协调算法，通过 `requestIdleCallback` 实现可中断渲染
3. 浏览器加载编译后的 ES Module，fiber 将虚拟 DOM 渲染到真实 DOM
