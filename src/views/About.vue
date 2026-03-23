<template>
  <div class="about-page">
    <div class="about-header">
      <div class="avatar">
        <span>Me</span>
      </div>
      <h1 class="name">关于我</h1>
      <p class="bio">一个热爱编程的开发者</p>
    </div>

    <div class="about-content">
      <section class="section">
        <h2>关于本站</h2>
        <p>
          这是一个使用 Vue 3 + TypeScript + Vite 构建的静态博客系统。
          文章使用 Markdown 格式编写，部署在 GitHub Pages 上。
        </p>
      </section>

      <section class="section">
        <h2>技术栈</h2>
        <ul class="tech-list">
          <li>Vue 3 (Composition API)</li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>Pinia</li>
          <li>Vue Router</li>
          <li>SCSS</li>
        </ul>
      </section>

      <section class="section">
        <h2>功能特性</h2>
        <ul class="feature-list">
          <li>Markdown 文章支持</li>
          <li>代码高亮</li>
          <li>亮/暗主题切换</li>
          <li>文章搜索</li>
          <li>分类与标签</li>
          <li>Giscus 评论系统</li>
          <li>阅读统计</li>
        </ul>
      </section>

      <section class="section">
        <h2>联系方式</h2>
        <div class="contact-links">
          <a href="https://github.com" target="_blank" rel="noopener" class="contact-link">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 2rem;
  color: white;
  font-weight: 700;
}

.name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.bio {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.section {
  margin-bottom: 32px;

  h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  p {
    line-height: 1.8;
    color: var(--text-secondary);
  }
}

.tech-list,
.feature-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;

  li {
    padding: 8px 12px;
    background-color: var(--bg-secondary);
    border-radius: $radius-sm;
    font-size: 0.9rem;
  }
}

.contact-links {
  display: flex;
  gap: 16px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--bg-secondary);
  border-radius: $radius-md;
  color: var(--text-primary);
  transition: all $transition-fast;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: $primary-color;
    color: white;
  }
}
</style>