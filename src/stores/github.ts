import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  html_url: string
}

const TOKEN_KEY = 'github-token'

export const useGitHubStore = defineStore('github', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<GitHubUser | null>(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearToken() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchUser(): Promise<GitHubUser | null> {
    if (!token.value) return null

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          clearToken()
        }
        return null
      }

      const data = await response.json()
      user.value = {
        login: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      }
      return user.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  async function createFile(
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<{ success: boolean; sha?: string; error?: string }> {
    if (!token.value) {
      return { success: false, error: '未登录' }
    }

    try {
      // 先检查文件是否存在
      const checkResponse = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      let sha: string | undefined
      if (checkResponse.ok) {
        const fileData = await checkResponse.json()
        sha = fileData.sha
      }

      // 创建或更新文件
      const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            ...(sha ? { sha } : {})
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '提交失败' }
      }

      return { success: true }
    } catch (error) {
      console.error('创建文件失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  async function getFile(
    repo: string,
    path: string
  ): Promise<{ content?: string; sha?: string; error?: string }> {
    if (!token.value) {
      return { error: '未登录' }
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return { error: '文件不存在' }
        }
        return { error: '获取文件失败' }
      }

      const data = await response.json()
      const content = decodeURIComponent(escape(atob(data.content)))
      return { content, sha: data.sha }
    } catch (error) {
      console.error('获取文件失败:', error)
      return { error: '网络错误' }
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    clearToken,
    fetchUser,
    createFile,
    getFile
  }
})