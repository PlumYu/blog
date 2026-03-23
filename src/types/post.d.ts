// 文章元信息
export interface PostMeta {
  title: string
  slug: string
  date: string
  categories: string[]
  tags: string[]
  excerpt: string
  cover?: string
  readingTime?: number
}

// 完整文章
export interface Post extends PostMeta {
  content: string
}

// 文章列表项
export interface PostListItem {
  title: string
  slug: string
  date: string
  categories: string[]
  tags: string[]
  excerpt: string
  cover?: string
}

// 分类信息
export interface Category {
  name: string
  count: number
}

// 标签信息
export interface Tag {
  name: string
  count: number
}

// 阅读统计
export interface ReadingStats {
  [slug: string]: number
}

// 搜索结果
export interface SearchResult {
  item: PostListItem
  matches?: {
    indices: [number, number][]
    value: string
  }[]
}