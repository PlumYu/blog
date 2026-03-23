<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-info">
        <p>&copy; {{ currentYear }} My Blog. All rights reserved.</p>
        <p class="powered-by">
          Powered by
          <a href="https://vuejs.org" target="_blank" rel="noopener">Vue 3</a>
          &
          <a href="https://vitejs.dev" target="_blank" rel="noopener">Vite</a>
        </p>
      </div>
      <div class="footer-links">
        <a href="https://github.com" target="_blank" rel="noopener" class="footer-link">
          GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-info {
  p {
    margin: 4px 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
}

.powered-by a {
  color: var(--link-color);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color $transition-fast;

  &:hover {
    color: var(--link-color);
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>