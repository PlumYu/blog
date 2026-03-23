<template>
  <div class="category-page">
    <div class="page-header">
      <h1 class="page-title">分类: {{ category }}</h1>
      <p class="page-desc">共 {{ posts.length }} 篇文章</p>
    </div>

    <div class="post-grid">
      <PostCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>

    <div v-if="posts.length === 0" class="empty-state">
      <p>该分类下暂无文章</p>
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

const category = computed(() => route.params.category as string)

const posts = computed(() =>
  allPosts.value.filter(post => post.categories.includes(category.value))
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

watch(category, (val) => {
  document.title = `分类: ${val} - My Blog`
}, { immediate: true })

onMounted(loadPosts)
</script>

<style lang="scss" scoped>
.category-page {
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