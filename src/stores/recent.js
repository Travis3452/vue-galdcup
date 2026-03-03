import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRecentStore = defineStore('recent', () => {
  // 초기값 로드
  const recentBoards = ref(JSON.parse(localStorage.getItem('recent_boards') || '[]'))

  const addBoard = (board) => {
    if (!board || !board.id || !board.topic) {
      console.warn('저장할 게시판 정보가 부족합니다:', board);
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
    localStorage.setItem('recent_boards', JSON.stringify(recentBoards.value))
    console.log('최근 방문 목록 업데이트 완료:', recentBoards.value)
  }

  const removeBoard = (id) => {
    recentBoards.value = recentBoards.value.filter(item => String(item.id) !== String(id))
    localStorage.setItem('recent_boards', JSON.stringify(recentBoards.value))
  }

  const clearHistory = () => {
    recentBoards.value = []
    localStorage.removeItem('recent_boards')
  }

  return { recentBoards, addBoard, removeBoard, clearHistory }
})