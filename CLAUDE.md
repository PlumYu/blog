# Project Specification: Vue3-Blog-Engine

## 1. 核心技术栈 (Core Stack)
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript (Strict Mode)
- **Build Tool**: Vite
- **Editor**: wangEditor (V5)
- **Styling**: Scoped CSS / SCSS
- **Deployment**: GitHub Pages (via GitHub Actions)

## 2. 编码规范 (Coding Standards)
- **命名规范**: 
  - 组件文件使用 **PascalCase** (如 `BlogEditor.vue`)。
  - 变量与函数使用 **camelCase**。
  - 常量使用 **SNAKE_CASE**。
- **TypeScript**: 
  - 严禁使用 `any`。所有 Props、Emits 和接口响应必须定义 `interface` 或 `type`。
  - 使用 `shallowRef` 处理 wangEditor 实例以优化性能。
- **组件结构**:
  - 必须包含 `<script setup lang="ts">`。
  - 样式必须使用 `scoped`。

## 3. wangEditor 渲染逻辑约束
- **数据流**: 
  - 编辑器输出统一为 **HTML 字符串**。
  - 渲染页面必须引入 `@wangeditor/editor/dist/css/style.css`。
  - 渲染容器必须挂载特定的类名：`.editor-content-view` 和 `.w-e-text-container`。
- **生命周期**: 
  - 必须在 `onBeforeUnmount` 中调用 `editor.destroy()` 以防止内存泄漏。
- **Markdown 兼容**:
  - 渲染逻辑优先保证 HTML 还原，若涉及 Markdown 互转，需使用 `turndown` 库。

## 4. 项目结构要求
- `src/components/`: 存放 UI 组件。
- `src/views/`: 存放页面级组件。
- `src/hooks/`: 存放封装的 Composition API (如 `useEditor.ts`)。
- `src/types/`: 存放全局类型定义文件 `.d.ts`。

## 5. 交互协议 (Instructions for Claude)
- **拒绝模版**: 不要生成带有大量注释的冗余代码，优先提供生产级别的逻辑。
- **代码完整性**: 修改代码时，必须给出完整的文件内容，不要只给片段（除非我明确要求）。
- **自动化优先**: 任何新增的页面或功能，都要考虑到在 GitHub Actions 环境下的构建兼容性。
- **Python 协作**: 如果需要处理本地 Markdown 文件迁移，请提供 Python 脚本工具类。