<template>
  <div class="tag-page">
    <div class="page-header">
      <h1 class="page-title">标签: #{{ tag }}</h1>
      <p class="page-desc">共 {{ posts.length }} 篇文章</p>
    </div>

    <div class="post-grid">
      <PostCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>

    <div v-if="posts.length === 0" class="empty-state">
      <p>该标签下暂无文章</p>
      <router-link to="/posts">查看全部文章</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '@/components/PostCard.vue'
import type { PostListItem } from '@/types/post'

const route = useRoute()

const allPosts = ref<PostListItem[]>([])

const tag = computed(() => route.params.tag as string)

const posts = computed(() =>
  allPosts.value.filter(post => post.tags.includes(tag.value))
)

async function loadPosts() {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'posts.json')
    const data = await response.json()
    allPosts.value = data.list || []
  } catch (error) {
    console.error('加载文章数据失败:', error)
  }
}

watch(tag, (val) => {
  document.title = `标签: ${val} - My Blog`
}, { immediate: true })

onMounted(loadPosts)
</script>

<style lang="scss" scoped>
.tag-page {
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

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);

  a {
    display: inline-block;
    margin-top: 16px;
    color: var(--link-color);
  }
}

@media (max-width: 768px) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>