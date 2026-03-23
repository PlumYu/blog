<template>
  <div class="post-list">
    <div class="page-header">
      <h1 class="page-title">全部文章</h1>
      <p class="page-desc">共 {{ posts.length }} 篇文章</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filters">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="filter-btn"
        :class="{ active: selectedCategory === cat.name }"
        @click="toggleCategory(cat.name)"
      >
        {{ cat.name }} ({{ cat.count }})
      </button>
    </div>

    <!-- 文章列表 -->
    <div class="post-grid">
      <PostCard v-for="post in filteredPosts" :key="post.slug" :post="post" />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredPosts.length === 0" class="empty-state">
      <p>暂无文章</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'
import type { PostListItem, Category } from '@/types/post'

const posts = ref<PostListItem[]>([])
const categories = ref<Category[]>([])
const selectedCategory = ref<string | null>(null)

const filteredPosts = computed(() => {
  if (!selectedCategory.value) return posts.value
  return posts.value.filter(post =>
    post.categories.includes(selectedCategory.value!)
  )
})

async function loadPosts() {
  try {
    const response = await fetch('/posts.json')
    const data = await response.json()
    posts.value = data.list || []

    // 统计分类
    const categoryMap = new Map<string, number>()
    posts.value.forEach(post => {
      post.categories.forEach(cat => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      })
    })

    categories.value = [
      { name: '全部', count: posts.value.length },
      ...Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    ]
  } catch (error) {
    console.error('加载文章数据失败:', error)
  }
}

function toggleCategory(cat: string) {
  if (cat === '全部') {
    selectedCategory.value = null
  } else {
    selectedCategory.value = selectedCategory.value === cat ? null : cat
  }
}

onMounted(loadPosts)
</script>

<style lang="scss" scoped>
.post-list {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-desc {
  color: var(--text-secondary);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 30px;
}

.filter-btn {
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all $transition-fast;

  &:hover {
    border-color: $primary-color;
  }

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
    color: white;
  }
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>