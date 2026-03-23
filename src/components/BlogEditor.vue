<template>
  <div class="editor-wrapper">
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createEditor, createToolbar, IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  modelValue?: string
  placeholder?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: '400px'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: IDomEditor | null = null

onMounted(() => {
  if (!editorContainer.value) return

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
    onChange(editor) {
      const html = editor.getHtml()
      emit('update:modelValue', html)
    },
    MENU_CONF: {
      uploadImage: {
        customUpload: async (file: File, insertFn: (url: string, alt: string, href: string) => void) => {
          // 这里可以集成图片上传到 GitHub 或其他存储
          // 目前使用 base64
          const reader = new FileReader()
          reader.onload = () => {
            insertFn(reader.result as string, file.name, '')
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: ['group-video']
  }

  editor = createEditor({
    selector: editorContainer.value,
    html: props.modelValue,
    config: editorConfig,
    mode: 'default'
  })

  createToolbar({
    editor,
    selector: editorContainer.value,
    config: toolbarConfig,
    mode: 'default'
  })
})

watch(() => props.modelValue, (newVal) => {
  if (editor && editor.getHtml() !== newVal) {
    editor.setHtml(newVal)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

// 暴露方法供父组件调用
defineExpose({
  getHtml: () => editor?.getHtml() || '',
  getText: () => editor?.getText() || '',
  setHtml: (html: string) => editor?.setHtml(html)
})
</script>

<style lang="scss" scoped>
.editor-wrapper {
  border: 1px solid var(--border-color);
  border-radius: $radius-md;
  overflow: hidden;
}

.editor-container {
  height: v-bind(height);
}

:deep(.w-e-text-container) {
  background-color: var(--card-bg);
}

:deep(.w-e-toolbar) {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

:deep(.w-e-text-container p),
:deep(.w-e-text-container h1),
:deep(.w-e-text-container h2),
:deep(.w-e-text-container h3) {
  color: var(--text-primary);
}
</style>