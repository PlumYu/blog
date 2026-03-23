import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = localStorage.getItem('blog-theme') as Theme | null
  const theme = ref<Theme>(storedTheme || 'light')

  // 监听主题变化，保存到 localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem('blog-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  return {
    theme,
    toggleTheme,
    setTheme
  }
})