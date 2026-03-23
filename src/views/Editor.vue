<template>
  <div class="editor-page">
    <!-- 登录提示 -->
    <div v-if="!githubStore.isLoggedIn" class="login-panel">
      <div class="login-card">
        <h2>在线编辑器</h2>
        <p class="login-desc">需要 GitHub Personal Access Token 才能编辑文章</p>

        <div class="token-form">
          <input
            v-model="inputToken"
            type="password"
            placeholder="输入你的 GitHub Token"
            class="token-input"
          />
          <button class="login-btn" @click="handleLogin" :disabled="!inputToken">
            登录
          </button>
        </div>

        <div class="token-help">
          <p>如何获取 Token：</p>
          <ol>
            <li>访问 <a href="https://github.com/settings/tokens/new" target="_blank">GitHub Token 设置</a></li>
            <li>填写 Note（如：blog-editor）</li>
            <li>勾选 <code>repo</code> 权限</li>
            <li>点击 Generate token 并复制</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- 编辑器 -->
    <div v-else class="editor-main">
      <div class="editor-header">
        <div class="user-info">
          <img :src="githubStore.user?.avatar_url" :alt="githubStore.user?.name" class="avatar" />
          <span class="username">{{ githubStore.user?.name }}</span>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
      </div>

      <div class="editor-toolbar">
        <button
          v-for="tab in (['write', 'settings'] as const)"
          :key="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab === 'write' ? '编辑文章' : '文章设置' }}
        </button>
      </div>

      <!-- 写作区域 -->
      <div v-show="activeTab === 'write'" class="write-area">
        <input
          v-model="postForm.title"
          type="text"
          placeholder="文章标题"
          class="title-input"
        />
        <BlogEditor ref="blogEditorRef" v-model="postForm.content" height="600px" />
      </div>

      <!-- 设置区域 -->
      <div v-show="activeTab === 'settings'" class="settings-area">
        <div class="form-group">
          <label>文章路径 (posts/xxx.md)</label>
          <input v-model="postForm.slug" type="text" placeholder="my-new-post" class="form-input" />
        </div>

        <div class="form-group">
          <label>发布日期</label>
          <input v-model="postForm.date" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label>分类（逗号分隔）</label>
          <input v-model="postForm.categoriesInput" type="text" placeholder="技术, Vue" class="form-input" />
        </div>

        <div class="form-group">
          <label>标签（逗号分隔）</label>
          <input v-model="postForm.tagsInput" type="text" placeholder="Vue, TypeScript" class="form-input" />
        </div>

        <div class="form-group">
          <label>摘要</label>
          <textarea v-model="postForm.excerpt" rows="3" placeholder="文章摘要..." class="form-textarea"></textarea>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="editor-actions">
        <button class="preview-btn" @click="handlePreview">预览</button>
        <button class="save-btn" @click="handleSave" :disabled="saving">
          {{ saving ? '保存中...' : '保存文章' }}
        </button>
      </div>

      <!-- 提示消息 -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreview" class="preview-modal" @click="showPreview = false">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <h3>文章预览</h3>
          <button class="close-btn" @click="showPreview = false">×</button>
        </div>
        <article class="post-content" v-html="postForm.content"></article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useGitHubStore } from '@/stores/github'
import BlogEditor from '@/components/BlogEditor.vue'

const githubStore = useGitHubStore()

const inputToken = ref('')
const activeTab = ref<'write' | 'settings'>('write')
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const showPreview = ref(false)
const blogEditorRef = ref<InstanceType<typeof BlogEditor> | null>(null)

const postForm = reactive({
  title: '',
  slug: '',
  date: new Date().toISOString().split('T')[0],
  categoriesInput: '',
  tagsInput: '',
  excerpt: '',
  content: '<p>开始写作...</p>'
})

async function handleLogin() {
  if (!inputToken.value.trim()) return

  githubStore.setToken(inputToken.value.trim())
  const user = await githubStore.fetchUser()

  if (user) {
    showMessage('登录成功！', 'success')
  } else {
    showMessage('Token 无效或已过期', 'error')
    githubStore.clearToken()
  }
}

function handleLogout() {
  githubStore.clearToken()
  inputToken.value = ''
  showMessage('已退出登录', 'success')
}

function handlePreview() {
  showPreview.value = true
}

async function handleSave() {
  if (!postForm.title.trim()) {
    showMessage('请输入文章标题', 'error')
    return
  }

  if (!postForm.slug.trim()) {
    // 自动生成 slug
    postForm.slug = postForm.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const categories = postForm.categoriesInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const tags = postForm.tagsInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const excerpt = postForm.excerpt || postForm.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 200)
    .trim()

  // 生成 Markdown 文件内容
  const markdownBody = blogEditorRef.value?.getMarkdown() || htmlToMarkdown(postForm.content)
  const markdown = `---
title: ${postForm.title}
date: ${postForm.date}
categories: [${categories.join(', ')}]
tags: [${tags.join(', ')}]
excerpt: ${excerpt}
---

${markdownBody}
`

  saving.value = true

  const result = await githubStore.createFile(
    `${githubStore.user?.login}/blog`,
    `posts/${postForm.slug}.md`,
    markdown,
    `docs: 新建/更新文章《${postForm.title}》`
  )

  saving.value = false

  if (result.success) {
    showMessage('文章保存成功！正在自动部署...', 'success')
    // 清空表单
    postForm.title = ''
    postForm.slug = ''
    postForm.content = '<p>开始写作...</p>'
    postForm.excerpt = ''
  } else {
    showMessage(result.error || '保存失败', 'error')
  }
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 简单的 HTML 转 Markdown（可后续增强）
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

onMounted(() => {
  if (githubStore.token) {
    githubStore.fetchUser()
  }
})
</script>

<style lang="scss" scoped>
.editor-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.login-panel {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.login-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius-lg;
  padding: 40px;
  max-width: 500px;
  width: 100%;

  h2 {
    margin-bottom: 8px;
  }

  .login-desc {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }
}

.token-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.token-input {
  flex: 1;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  color: var(--text-primary);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.login-btn {
  padding: 12px 24px;
  background-color: $primary-color;
  color: white;
  border-radius: $radius-md;
  font-weight: 500;
  transition: background-color $transition-fast;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.token-help {
  font-size: 0.85rem;
  color: var(--text-secondary);

  ol {
    margin-top: 8px;
    padding-left: 20px;

    li {
      margin: 8px 0;
    }
  }

  code {
    background-color: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: $radius-sm;
    font-family: $font-mono;
  }

  a {
    color: var(--link-color);
  }
}

.editor-header {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
}

.logout-btn {
  margin-left: auto;
  padding: 6px 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;

  &:hover {
    color: $error-color;
  }
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.tab-btn {
  padding: 8px 16px;
  color: var(--text-secondary);
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  &.active {
    color: $primary-color;
    background-color: var(--bg-secondary);
  }
}

.write-area {
  .title-input {
    width: 100%;
    padding: 16px;
    font-size: 1.5rem;
    font-weight: 600;
    background-color: transparent;
    border: none;
    color: var(--text-primary);
    margin-bottom: 20px;

    &::placeholder {
      color: var(--text-secondary);
    }

    &:focus {
      outline: none;
    }
  }
}

.settings-area {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius-lg;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  color: var(--text-primary);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.preview-btn {
  padding: 12px 24px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  color: var(--text-primary);
  font-weight: 500;

  &:hover {
    background-color: var(--border-color);
  }
}

.save-btn {
  padding: 12px 24px;
  background-color: $primary-color;
  color: white;
  border-radius: $radius-md;
  font-weight: 500;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: $radius-md;
  font-weight: 500;
  z-index: 1000;

  &.success {
    background-color: $success-color;
    color: white;
  }

  &.error {
    background-color: $error-color;
    color: white;
  }
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-content {
  background-color: var(--card-bg);
  border-radius: $radius-lg;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);

  h3 {
    margin: 0;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  color: var(--text-secondary);

  &:hover {
    color: var(--text-primary);
  }
}
</style>