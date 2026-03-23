import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { marked } from 'marked'
import type { PostMeta, PostListItem } from '../src/types/post'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const POSTS_DIR = path.resolve(__dirname, '../posts')
const OUTPUT_FILE = path.resolve(__dirname, '../public/posts.json')

interface RawPost {
  meta: PostMeta
  content: string
}

// 计算阅读时间（假设每分钟阅读 300 字）
function calculateReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, '').length
  return Math.ceil(words / 300)
}

// 生成 slug（从文件名）
function generateSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// 递归扫描目录
function scanDirectory(dir: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    console.log(`目录 ${dir} 不存在，正在创建...`)
    fs.mkdirSync(dir, { recursive: true })
    return files
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...scanDirectory(fullPath))
    } else if (item.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

// 解析 Markdown 文件
function parseMarkdown(filePath: string): RawPost | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data, content: markdownContent } = matter(content)

    const filename = path.basename(filePath)
    const slug = data.slug || generateSlug(filename)

    // 验证必要的 frontmatter 字段
    if (!data.title) {
      console.warn(`警告: ${filePath} 缺少 title 字段`)
      return null
    }

    const htmlContent = marked(markdownContent) as string
    const excerpt = data.excerpt || markdownContent.slice(0, 200).replace(/[#*`]/g, '').trim()

    const meta: PostMeta = {
      title: data.title,
      slug,
      date: data.date || new Date().toISOString().split('T')[0],
      categories: data.categories || [],
      tags: data.tags || [],
      excerpt,
      cover: data.cover,
      readingTime: calculateReadingTime(htmlContent)
    }

    return {
      meta,
      content: htmlContent
    }
  } catch (error) {
    console.error(`解析文件 ${filePath} 失败:`, error)
    return null
  }
}

// 主函数
function buildPosts() {
  console.log('开始构建文章数据...')

  const files = scanDirectory(POSTS_DIR)
  console.log(`找到 ${files.length} 个 Markdown 文件`)

  const posts: RawPost[] = []
  const postList: PostListItem[] = []

  for (const file of files) {
    const post = parseMarkdown(file)
    if (post) {
      posts.push(post)
      postList.push({
        title: post.meta.title,
        slug: post.meta.slug,
        date: post.meta.date,
        categories: post.meta.categories,
        tags: post.meta.tags,
        excerpt: post.meta.excerpt,
        cover: post.meta.cover
      })
    }
  }

  // 按日期排序（最新在前）
  posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime())
  postList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 输出数据
  const output = {
    posts: Object.fromEntries(posts.map(p => [p.meta.slug, p])),
    list: postList
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`构建完成！共 ${posts.length} 篇文章`)
  console.log(`输出文件: ${OUTPUT_FILE}`)
}

// 执行构建
buildPosts()