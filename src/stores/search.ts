import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    isSearching: false
  }),
  actions: {
    setKeyword(keyword: string) {
      this.keyword = keyword
    },
    setSearching(status: boolean) {
      this.isSearching = status
    }
  }
})