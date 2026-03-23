<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
        @input="handleSearch"
        @focus="showResults = true"
      />
      <button v-if="keyword" class="clear-btn" @click="clearSearch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 搜索结果下拉 -->
    <div v-if="showResults && results.length > 0" class="search-results">
      <router-link
        v-for="result in results"
        :key="result.slug"
        :to="`/post/${result.slug}`"
        class="search-result-item"
        @click="closeResults"
      >
        <span class="result-title">{{ result.title }}</span>
        <span class="result-date">{{ formatDate(result.date) }}</span>
      </router-link>
    </div>

    <!-- 点击外部关闭 -->
    <div v-if="showResults" class="search-overlay" @click="closeResults"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Fuse from 'fuse.js'
import type { PostListItem } from '@/types/post'

const keyword = ref('')
const showResults = ref(false)
const results = ref<PostListItem[]>([])
let fuse: Fuse<PostListItem> | null = null
let postsData: { list: PostListItem[] } | null = null

// 加载文章数据
async function loadPosts() {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'posts.json')
    postsData = await response.json()

    if (postsData) {
      fuse = new Fuse(postsData.list, {
        keys: ['title', 'excerpt', 'tags'],
        threshold: 0.4,
        includeScore: true
      })
    }
  } catch (error) {
    console.error('加载文章数据失败:', error)
  }
}

// 搜索处理
function handleSearch() {
  if (!fuse || !keyword.value.trim()) {
    results.value = []
    return
  }

  const searchResults = fuse.search(keyword.value, { limit: 5 })
  results.value = searchResults.map(r => r.item)
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  results.value = []
  showResults.value = false
}

// 关闭结果
function closeResults() {
  showResults.value = false
}

// 格式化日期
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ESC 关闭
function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeResults()
  }
}

onMounted(() => {
  loadPosts()
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
})
</script>

<style lang="scss" scoped>
.search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 200px;
  height: 40px;
  padding: 0 36px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $radius-lg;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all $transition-fast;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
    border-color: $primary-color;
    width: 280px;
  }
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color $transition-fast;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: var(--text-primary);
  }
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 200;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: var(--text-primary);
  transition: background-color $transition-fast;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
}

.result-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-left: 12px;
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

@media (max-width: 768px) {
  .search-input {
    width: 150px;

    &:focus {
      width: 200px;
    }
  }
}
</style>