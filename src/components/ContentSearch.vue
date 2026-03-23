<template>
  <div class="content-search">
    <div class="search-bar">
      <input
        v-model="keyword"
        type="text"
        placeholder="在文章中搜索..."
        class="search-input"
        @input="handleSearch"
      />
      <span v-if="matchCount > 0" class="match-info">
        {{ currentIndex + 1 }} / {{ matchCount }}
      </span>
    </div>
    <div v-if="keyword" class="search-actions">
      <button class="action-btn" @click="prevMatch" :disabled="matchCount === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="action-btn" @click="nextMatch" :disabled="matchCount === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <button class="action-btn clear" @click="clearSearch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const keyword = ref('')
const matchCount = ref(0)
const currentIndex = ref(0)
const highlights = ref<HTMLElement[]>([])

// 高亮所有匹配
function highlightAll() {
  const container = document.querySelector('.post-content')
  if (!container || !keyword.value.trim()) {
    clearHighlights()
    return
  }

  clearHighlights()

  const regex = new RegExp(`(${escapeRegExp(keyword.value)})`, 'gi')
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  )

  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach(node => {
    const text = node.textContent || ''
    if (regex.test(text)) {
      const span = document.createElement('span')
      span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>')
      node.parentNode?.replaceChild(span, node)
    }
  })

  highlights.value = Array.from(document.querySelectorAll('.highlight'))
  matchCount.value = highlights.value.length
  currentIndex.value = 0

  if (highlights.value.length > 0) {
    scrollToHighlight(0)
  }
}

// 清除高亮
function clearHighlights() {
  highlights.value.forEach(el => {
    const parent = el.parentNode
    if (parent) {
      parent.textContent = parent.textContent
    }
  })
  highlights.value = []
  matchCount.value = 0
  currentIndex.value = 0
}

// 滚动到高亮
function scrollToHighlight(index: number) {
  if (highlights.value[index]) {
    highlights.value.forEach(el => el.classList.remove('active'))
    highlights.value[index].classList.add('active')
    highlights.value[index].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}

// 上一个
function prevMatch() {
  if (matchCount.value === 0) return
  currentIndex.value = (currentIndex.value - 1 + matchCount.value) % matchCount.value
  scrollToHighlight(currentIndex.value)
}

// 下一个
function nextMatch() {
  if (matchCount.value === 0) return
  currentIndex.value = (currentIndex.value + 1) % matchCount.value
  scrollToHighlight(currentIndex.value)
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  clearHighlights()
}

// 转义正则特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 防抖
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(highlightAll, 300)
}

// 键盘快捷键
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      prevMatch()
    } else {
      nextMatch()
    }
  }
}

watch(keyword, (val) => {
  if (!val.trim()) {
    clearHighlights()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearHighlights()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.content-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-secondary);
  border-radius: $radius-md;
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.875rem;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
  }
}

.match-info {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.search-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border-radius: $radius-sm;
  color: var(--text-primary);
  transition: background-color $transition-fast;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background-color: $primary-color;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.clear:hover {
    background-color: $error-color;
  }
}
</style>

<style lang="scss">
// 全局高亮样式
.highlight {
  background-color: rgba(255, 214, 0, 0.4);
  padding: 0 2px;
  border-radius: 2px;

  &.active {
    background-color: rgba(255, 214, 0, 0.8);
  }
}

.theme-dark .highlight {
  background-color: rgba(255, 200, 0, 0.3);

  &.active {
    background-color: rgba(255, 200, 0, 0.6);
  }
}
</style>