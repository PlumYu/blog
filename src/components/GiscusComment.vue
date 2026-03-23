<template>
  <div class="giscus-comment">
    <Giscus
      repo="plumyu/blog"
      repo-id=""
      category="Announcements"
      category-id=""
      mapping="pathname"
      strict="0"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import Giscus from '@giscus/vue'
</script>

<style lang="scss" scoped>
.giscus-comment {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
</style>