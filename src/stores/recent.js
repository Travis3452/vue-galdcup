import { defineStore } from 'pinia'
import { ref } from 'vue'
import { readStoredArray, writeStorage, removeStorage } from '../utils/storage.js'

export const useRecentStore = defineStore('recent', () => {
  // 초기값 로드
  const recentBoards = ref(readStoredArray('recent_boards')
    .filter(board => board && /^\d+$/.test(String(board.id)) && typeof board.topic === 'string')
    .slice(0, 10))

  const addBoard = (board) => {
    if (!board || !board.id || !board.topic) {
      return;
    }

    const newEntry = {
      id: String(board.id), // ID 타입을 문자열로 통일
      topic: board.topic,
      visitedAt: Date.now()
    }

    // 중복 제거 (ID 기준)
    const filtered = recentBoards.value.filter(item => String(item.id) !== String(board.id))
    
    // 최신순으로 맨 앞에 추가 후 최대 10개 유지
    recentBoards.value = [newEntry, ...filtered].slice(0, 10)

    // 로컬 스토리지 저장
    writeStorage('recent_boards', JSON.stringify(recentBoards.value))
  }

  const removeBoard = (id) => {
    recentBoards.value = recentBoards.value.filter(item => String(item.id) !== String(id))
    writeStorage('recent_boards', JSON.stringify(recentBoards.value))
  }

  const clearHistory = () => {
    recentBoards.value = []
    removeStorage('recent_boards')
  }

  return { recentBoards, addBoard, removeBoard, clearHistory }
})
