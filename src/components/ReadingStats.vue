<template>
  <div class="reading-stats">
    <span class="stat-item">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span>阅读 {{ viewCount }} 次</span>
    </span>
    <span v-if="readingTime" class="stat-item">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>约 {{ readingTime }} 分钟</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  slug: string
  readingTime?: number
}

const props = defineProps<Props>()

const viewCount = ref(0)

const STORAGE_KEY = 'blog-reading-stats'

function loadStats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const stats = JSON.parse(stored)
      return stats
    }
  } catch {
    console.error('读取阅读统计失败')
  }
  return {}
}

function saveStats(stats: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    console.error('保存阅读统计失败')
  }
}

onMounted(() => {
  const stats = loadStats()
  const currentCount = stats[props.slug] || 0
  viewCount.value = currentCount + 1
  stats[props.slug] = viewCount.value
  saveStats(stats)
})
</script>

<style lang="scss" scoped>
.reading-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>