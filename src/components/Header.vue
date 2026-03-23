<template>
  <header class="header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="logo-text">My Blog</span>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/posts" class="nav-link">文章</router-link>
        <router-link to="/editor" class="nav-link editor-link">写文章</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
      </nav>

      <div class="header-actions">
        <SearchBox />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchBox from './SearchBox.vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--header-bg);
  box-shadow: var(--header-shadow);
  transition: background-color $transition-normal;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: var(--text-primary);
  font-weight: 500;
  padding: 8px 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: $primary-color;
    transition: width $transition-fast;
  }

  &:hover::after,
  &.router-link-active::after {
    width: 100%;
  }

  &.editor-link {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .header-content {
    justify-content: space-between;
  }
}
</style>