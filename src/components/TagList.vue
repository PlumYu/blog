<template>
  <div class="tag-list">
    <router-link
      v-for="tag in tags"
      :key="tag.name"
      :to="`/tag/${tag.name}`"
      class="tag-item"
    >
      <span class="tag-name">#{{ tag.name }}</span>
      <span class="tag-count">{{ tag.count }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '@/types/post'

interface Props {
  tags: Tag[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--bg-secondary);
  border-radius: $radius-md;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all $transition-fast;

  &:hover {
    background-color: $primary-color;
    color: white;
  }
}

.tag-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: $radius-sm;
  font-size: 0.75rem;
}
</style>