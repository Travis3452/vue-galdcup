<template>
  <div class="min-h-screen bg-indigo-50 flex justify-center py-12">
    <div class="w-[90%] max-w-3xl bg-white border-2 border-gray-200 rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-extrabold text-indigo-700 text-center mb-6">⚔️ 투표 현황</h2>

      <div v-if="isLoading" class="animate-pulse space-y-8">
        <div class="flex justify-center">
          <div class="w-64 h-64 bg-slate-200 rounded-full"></div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="flex items-center gap-4 bg-slate-100 rounded-lg p-4 h-24">
            <div class="w-16 h-16 bg-slate-200 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="w-20 h-4 bg-slate-200 rounded"></div>
              <div class="w-12 h-3 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="flex justify-center mb-8 h-[300px] relative">
          <canvas id="votePieChart"></canvas>
        </div>

        <div v-if="!hasVotes" class="text-center text-gray-500 py-10">
          아직 투표가 없습니다. 첫 투표의 주인공이 되어보세요!
        </div>

        <div v-else class="grid grid-cols-2 gap-6">
          <div
            v-for="(opt, idx) in voteStatus?.options"
            :key="idx"
            class="flex items-center gap-4 bg-indigo-50 rounded-lg p-4 border border-gray-200 transition-all duration-300"
          >
            <img
              :src="opt.imageUrl || 'https://via.placeholder.com/80'"
              class="w-16 h-16 object-cover rounded border bg-white"
            />
            <div>
              <p class="font-bold text-gray-800">{{ opt.label }}</p>
              <p class="text-lg font-black text-indigo-600">{{ opt.count.toLocaleString() }}표</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import Chart from 'chart.js/auto'
import { Client } from '@stomp/stompjs' // ✨ 추가

const route = useRoute()
const voteStatus = ref(null)
const isLoading = ref(true) // ✨ 로딩 상태
let chartInstance = null // ✨ 차트 인스턴스 관리
let client = null // ✨ 웹소켓 클라이언트

const hasVotes = computed(() => {
  if (!voteStatus.value?.options) return false
  return voteStatus.value.options.some(o => o.count > 0)
})

// --- ✨ WebSocket 연결 로직 ---
const connectWebSocket = () => {
  if (!voteStatus.value?.id) return

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const socketURL = baseURL.replace(/^http/, 'ws') + '/ws-galdcup'

  client = new Client({
    brokerURL: socketURL,
    onConnect: () => {
      console.log('차트 페이지 실시간 연결 성공')
      client.subscribe(`/topic/votes/${voteStatus.value.id}`, (message) => {
        const countsMap = JSON.parse(message.body)
        
        // 1. 데이터 업데이트
        voteStatus.value.options.forEach((opt, index) => {
          if (countsMap[index] !== undefined) {
            opt.count = countsMap[index]
          }
        })

        // 2. ✨ 차트 실시간 업데이트
        if (chartInstance) {
          chartInstance.data.datasets[0].data = voteStatus.value.options.map(o => o.count)
          chartInstance.update('none') // 'none' 옵션으로 애니메이션 튀지 않게 업데이트
        }
      })
    }
  })
  client.activate()
}

// --- 차트 생성 로직 ---
const initChart = async () => {
  await nextTick()
  const canvas = document.getElementById('votePieChart')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')

  // 이미지 패턴 생성
  const images = await Promise.all(
    voteStatus.value.options.map(opt => {
      return new Promise(resolve => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = opt.imageUrl || 'https://via.placeholder.com/80'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
      })
    })
  )

  const patterns = images.map(img => img ? ctx.createPattern(img, 'repeat') : '#f1f5f9')

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: voteStatus.value.options.map(o => o.label),
      datasets: [
        {
          data: voteStatus.value.options.map(o => o.count),
          backgroundColor: patterns,
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/boards/${route.params.boardId}/vote-session`)
    voteStatus.value = res.data

    if (hasVotes.value) {
      await initChart()
    }
    
    // 데이터 로드 후 웹소켓 연결
    connectWebSocket()
  } catch (err) {
    console.error('현황 로드 실패:', err)
  } finally {
    setTimeout(() => { isLoading.value = false }, 400)
  }
})

onUnmounted(() => {
  if (client) client.deactivate()
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
/* 차트 캔버스 높이 확보 */
#votePieChart {
  max-height: 300px !important;
}
</style>