<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <h1 class="hero-title">欢迎来到我的博客</h1>
      <p class="hero-subtitle">记录技术与生活的点滴</p>
    </section>

    <!-- 最新文章 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">最新文章</h2>
        <router-link to="/posts" class="view-all">查看全部 →</router-link>
      </div>
      <div class="post-grid">
        <PostCard v-for="post in latestPosts" :key="post.slug" :post="post" />
      </div>
    </section>

    <!-- 分类 -->
    <section class="section">
      <h2 class="section-title">分类</h2>
      <div class="category-grid">
        <router-link
          v-for="cat in categories"
          :key="cat.name"
          :to="`/category/${cat.name}`"
          class="category-card"
        >
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }} 篇</span>
        </router-link>
      </div>
    </section>

    <!-- 标签云 -->
    <section class="section">
      <h2 class="section-title">标签</h2>
      <TagList :tags="tags" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'
import TagList from '@/components/TagList.vue'
import type { PostListItem, Category, Tag } from '@/types/post'

const posts = ref<PostListItem[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const latestPosts = computed(() => posts.value.slice(0, 6))

async function loadPosts() {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'posts.json')
    const data = await response.json()
    posts.value = data.list || []

    // 统计分类
    const categoryMap = new Map<string, number>()
    const tagMap = new Map<string, number>()

    posts.value.forEach(post => {
      post.categories.forEach(cat => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      })
      post.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })

    categories.value = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    tags.value = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('加载文章数据失败:', error)
  }
}

onMounted(loadPosts)
</script>

<style lang="scss" scoped>
.home {
  padding: 20px 0;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border-radius: $radius-lg;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.view-all {
  color: var(--link-color);
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  color: var(--text-primary);
  transition: all $transition-fast;

  &:hover {
    border-color: $primary-color;
    transform: translateY(-2px);
  }
}

.category-name {
  font-weight: 500;
}

.category-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 16px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>