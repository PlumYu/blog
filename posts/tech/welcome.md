---
title: 欢迎来到我的博客
date: 2024-01-15
categories: [技术]
tags: [Vue, TypeScript, 博客]
excerpt: 这是我的第一篇博客文章，介绍了我使用 Vue 3 + TypeScript 构建静态博客系统的经历。
---

# 欢迎来到我的博客

这是我使用 Vue 3 + TypeScript + Vite 构建的静态博客系统。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: SCSS
- **部署**: GitHub Pages

## 主要功能

1. 文章展示与分类
2. 标签系统
3. 暗/亮主题切换
4. 文章搜索
5. Giscus 评论系统

## 代码示例

```typescript
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
```

## 为什么选择静态博客？

静态博客有以下优点：

- **速度快**: 无需数据库查询，页面加载迅速
- **安全性高**: 没有后端服务，攻击面小
- **免费托管**: GitHub Pages 提供免费托管服务
- **版本控制**: 文章与代码一起管理

希望你能喜欢这个博客！