<template>
  <div class="editor-with-preview">
    <!-- 编辑区域 -->
    <div class="editor-panel">
      <div class="panel-header">
        <span>编辑</span>
        <div class="editor-mode">
          <button
            v-for="m in ['富文本', 'Markdown'] as const"
            :key="m"
            :class="{ active: mode === m }"
            @click="switchMode(m)"
          >
            {{ m }}
          </button>
        </div>
      </div>

      <!-- 富文本编辑器 -->
      <div v-show="mode === '富文本'" class="rich-editor">
        <div ref="toolbarContainer" class="toolbar-container"></div>
        <div ref="editorContainer" class="editor-container"></div>
      </div>

      <!-- Markdown 编辑器 -->
      <div v-show="mode === 'Markdown'" class="md-editor">
        <textarea
          v-model="markdownContent"
          placeholder="使用 Markdown 语法编写..."
          class="md-textarea"
        ></textarea>
        <div class="md-toolbar">
          <button @click="insertMd('**', '**')" title="粗体">B</button>
          <button @click="insertMd('*', '*')" title="斜体"><i>I</i></button>
          <button @click="insertMd('## ', '')" title="标题">H</button>
          <button @click="insertMd('[', '](url)')" title="链接">🔗</button>
          <button @click="insertMd('`', '`')" title="行内代码">代码</button>
          <button @click="insertMd('\n```\n', '\n```\n')" title="代码块">代码块</button>
          <button @click="insertMd('- ', '')" title="列表">列表</button>
          <button @click="insertMd('> ', '')" title="引用">引用</button>
          <button @click="insertMd('\n---\n', '')" title="分割线">—</button>
          <button @click="insertMd('![alt](', ')')" title="图片">图片</button>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-panel">
      <div class="panel-header">
        <span>预览</span>
      </div>
      <div class="preview-content" v-html="previewHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { createEditor, createToolbar, IDomEditor, IEditorConfig } from '@wangeditor/editor'
import { marked } from 'marked'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  modelValue?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '500px'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const mode = ref<'富文本' | 'Markdown'>('富文本')
const editorContainer = ref<HTMLElement | null>(null)
const toolbarContainer = ref<HTMLElement | null>(null)
const markdownContent = ref('')
let editor: IDomEditor | null = null

// 代码高亮扩展
const highlightCode = (html: string): string => {
  return html.replace(/<pre><code(?: class="language-(\w+)")?>/g, (_match, lang) => {
    return `<pre><code class="hljs language-${lang || ''}">`
  })
}

// 自定义渲染
const renderMarkdown = (text: string): string => {
  const rawHtml = marked.parse(text, { breaks: true, gfm: true }) as string
  return highlightCode(rawHtml)
}

// 预览 HTML
const previewHtml = computed(() => {
  if (mode.value === 'Markdown') {
    return renderMarkdown(markdownContent.value)
  }
  return props.modelValue
})

// 切换模式
function switchMode(newMode: '富文本' | 'Markdown') {
  if (newMode === mode.value) return

  if (newMode === 'Markdown') {
    // 切换到 Markdown 模式，尝试从富文本提取内容
    if (editor) {
      markdownContent.value = htmlToMarkdown(editor.getHtml())
    }
  } else {
    // 切换到富文本模式，将 Markdown 转为 HTML
    if (editor) {
      const html = renderMarkdown(markdownContent.value)
      editor.setHtml(html)
      emit('update:modelValue', html)
    }
  }

  mode.value = newMode
}

// 插入 Markdown 语法
function insertMd(before: string, after: string) {
  const textarea = document.querySelector('.md-textarea') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = markdownContent.value.substring(start, end)

  markdownContent.value =
    markdownContent.value.substring(0, start) +
    before + selected + after +
    markdownContent.value.substring(end)

  // 恢复焦点和选区
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
  }, 0)
}

// HTML 转 Markdown
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gis, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gis, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gis, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '\n```\n$1\n```\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '\n> $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
}

// 监听 Markdown 内容变化
watch(markdownContent, (val) => {
  if (mode.value === 'Markdown') {
    emit('update:modelValue', marked(val) as string)
  }
})

onMounted(() => {
  if (!editorContainer.value || !toolbarContainer.value) return

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '开始编写文章...',
    onChange(editor) {
      if (mode.value === '富文本') {
        emit('update:modelValue', editor.getHtml())
      }
    },
    MENU_CONF: {
      codeSelectLang: {
        codeLangs: [
          { text: 'CSS', value: 'css' },
          { text: 'HTML', value: 'html' },
          { text: 'XML', value: 'xml' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'TypeScript', value: 'typescript' },
          { text: 'Java', value: 'java' },
          { text: 'Python', value: 'python' },
          { text: 'C', value: 'c' },
          { text: 'C++', value: 'cpp' },
          { text: 'C#', value: 'csharp' },
          { text: 'PHP', value: 'php' },
          { text: 'Go', value: 'go' },
          { text: 'Shell', value: 'shell' },
          { text: 'SQL', value: 'sql' },
          { text: 'JSON', value: 'json' },
          { text: 'Markdown', value: 'markdown' },
        ]
      },
      uploadImage: {
        customUpload: async (file: File, insertFn: (url: string, alt: string, href: string) => void) => {
          const reader = new FileReader()
          reader.onload = () => {
            insertFn(reader.result as string, file.name, '')
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  editor = createEditor({
    selector: editorContainer.value,
    html: props.modelValue,
    config: editorConfig,
    mode: 'default'
  })

  createToolbar({
    editor,
    selector: toolbarContainer.value,
    config: {
      // 不排除任何按钮，显示完整工具栏
    },
    mode: 'default'
  })
})

watch(() => props.modelValue, (newVal) => {
  if (mode.value === '富文本' && editor && editor.getHtml() !== newVal) {
    editor.setHtml(newVal)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

defineExpose({
  getHtml: () => {
    if (mode.value === 'Markdown') {
      return renderMarkdown(markdownContent.value)
    }
    return editor?.getHtml() || ''
  },
  getMarkdown: () => {
    if (mode.value === 'Markdown') {
      return markdownContent.value
    }
    return editor ? htmlToMarkdown(editor.getHtml()) : ''
  },
  setHtml: (html: string) => {
    if (editor) editor.setHtml(html)
  }
})
</script>

<style lang="scss" scoped>
.editor-with-preview {
  display: flex;
  gap: 20px;
  height: v-bind(height);
  border: 1px solid var(--border-color);
  border-radius: $radius-lg;
  overflow: hidden;
}

.editor-panel,
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}

.editor-mode {
  display: flex;
  gap: 4px;

  button {
    padding: 4px 12px;
    font-size: 0.8rem;
    border-radius: $radius-sm;
    color: var(--text-secondary);
    transition: all $transition-fast;

    &.active {
      background-color: $primary-color;
      color: white;
    }

    &:hover:not(.active) {
      background-color: var(--border-color);
    }
  }
}

.rich-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar-container {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.editor-container {
  flex: 1;
  overflow-y: auto;
}

.md-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.md-textarea {
  flex: 1;
  padding: 16px;
  background-color: var(--card-bg);
  border: none;
  color: var(--text-primary);
  font-family: $font-mono;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;

  &:focus {
    outline: none;
  }
}

.md-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);

  button {
    padding: 6px 10px;
    font-size: 0.8rem;
    border-radius: $radius-sm;
    color: var(--text-secondary);
    transition: all $transition-fast;

    &:hover {
      background-color: var(--border-color);
      color: var(--text-primary);
    }
  }
}

.preview-panel {
  border-left: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.8;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 1em 0 0.5em;
    line-height: 1.3;
  }

  :deep(h1) { font-size: 1.8em; }
  :deep(h2) { font-size: 1.5em; }
  :deep(h3) { font-size: 1.25em; }

  :deep(p) {
    margin: 0.8em 0;
  }

  :deep(pre) {
    background-color: var(--code-bg);
    padding: 12px;
    border-radius: $radius-md;
    overflow-x: auto;
    margin: 1em 0;
  }

  :deep(code) {
    font-family: $font-mono;
    font-size: 0.9em;
  }

  :deep(blockquote) {
    border-left: 4px solid $primary-color;
    padding-left: 16px;
    margin: 1em 0;
    color: var(--text-secondary);
  }

  :deep(ul), :deep(ol) {
    padding-left: 24px;
    margin: 0.8em 0;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: $radius-md;
  }

  :deep(a) {
    color: var(--link-color);

    &:hover {
      text-decoration: underline;
    }
  }
}

// wangEditor 样式覆盖
:deep(.w-e-text-container) {
  background-color: var(--card-bg);
}

:deep(.w-e-toolbar) {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

:deep(.w-e-bar-divider) {
  margin: 4px;
}

:deep(.w-e-text-container p),
:deep(.w-e-text-container h1),
:deep(.w-e-text-container h2),
:deep(.w-e-text-container h3) {
  color: var(--text-primary);
}

:deep(.w-e-text-container pre) {
  background-color: var(--code-bg);
}

:deep(.w-e-text-container code) {
  font-family: $font-mono;
}
</style>