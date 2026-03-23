<template>
  <article v-if="post" class="post-detail">
    <!-- 文章头部 -->
    <header class="post-header">
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-meta">
        <time>{{ formatDate(post.date) }}</time>
        <span class="separator">·</span>
        <router-link
          v-for="cat in post.categories"
          :key="cat"
          :to="`/category/${cat}`"
          class="category-link"
        >
          {{ cat }}
        </router-link>
      </div>
      <ReadingStats :slug="slug" :reading-time="post.readingTime" />
    </header>

    <!-- 内容搜索 -->
    <ContentSearch />

    <!-- 文章内容 -->
    <div class="post-content" v-html="post.content"></div>

    <!-- 标签 -->
    <footer class="post-footer">
      <div class="post-tags">
        <router-link
          v-for="tag in post.tags"
          :key="tag"
          :to="`/tag/${tag}`"
          class="tag-link"
        >
          #{{ tag }}
        </router-link>
      </div>
    </footer>

    <!-- 评论 -->
    <GiscusComment />
  </article>

  <!-- 加载中 -->
  <div v-else-if="loading" class="loading">
    <p>加载中...</p>
  </div>

  <!-- 未找到 -->
  <div v-else class="not-found">
    <h1>文章不存在</h1>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ContentSearch from '@/components/ContentSearch.vue'
import ReadingStats from '@/components/ReadingStats.vue'
import GiscusComment from '@/components/GiscusComment.vue'
import type { Post } from '@/types/post'
import hljs from 'highlight.js'

const route = useRoute()
const slug = route.params.slug as string

const post = ref<Post | null>(null)
const loading = ref(true)

async function loadPost() {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'posts.json')
    const data = await response.json()
    post.value = data.posts?.[slug] || null

    // 更新页面标题
    if (post.value) {
      document.title = `${post.value.title} - My Blog`
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadPost().then(() => {
    // 代码高亮
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block as HTMLElement)
    })
  })
})
</script>

<style lang="scss" scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
}

.post-header {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.post-title {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.separator {
  color: var(--border-color);
}

.category-link {
  color: var(--link-color);

  &:hover {
    text-decoration: underline;
  }
}

.post-content {
  line-height: 1.8;

  :deep(h2) {
    margin-top: 40px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  :deep(h3) {
    margin-top: 32px;
  }

  :deep(p) {
    margin: 16px 0;
  }

  :deep(ul), :deep(ol) {
    margin: 16px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin: 8px 0;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: $radius-md;
    margin: 20px 0;
  }

  :deep(a) {
    color: var(--link-color);
    text-decoration: underline;

    &:hover {
      color: var(--link-hover);
    }
  }
}

.post-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-link {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--bg-secondary);
  border-radius: $radius-md;
  color: var(--text-secondary);
  font-size: 0.875rem;

  &:hover {
    background-color: $primary-color;
    color: white;
  }
}

.loading,
.not-found {
  text-align: center;
  padding: 80px 20px;
}

.not-found h1 {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.75rem;
  }
}
</style>