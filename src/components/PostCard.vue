<template>
  <router-link :to="`/post/${post.slug}`" class="post-card">
    <article class="card-content">
      <div v-if="post.cover" class="card-cover">
        <img :src="post.cover" :alt="post.title" loading="lazy" />
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ post.title }}</h3>
        <p class="card-excerpt">{{ post.excerpt }}</p>
        <div class="card-meta">
          <time class="card-date">{{ formatDate(post.date) }}</time>
          <div class="card-tags">
            <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </router-link>
</template>

<script setup lang="ts">
import type { PostListItem } from '@/types/post'

interface Props {
  post: PostListItem
}

defineProps<Props>()

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
.post-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-content {
  background-color: var(--card-bg);
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: transform $transition-fast, box-shadow $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.card-cover {
  aspect-ratio: 16 / 9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-normal;
  }

  .card-content:hover & img {
    transform: scale(1.05);
  }
}

.card-body {
  padding: $spacing-lg;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: $spacing-sm;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-excerpt {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: $spacing-md;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.card-tags {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  border-radius: $radius-sm;
  transition: background-color $transition-fast;

  &:hover {
    background-color: $primary-color;
    color: white;
  }
}
</style>