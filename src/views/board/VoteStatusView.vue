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
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useBoardStore } from '@/stores/board' // 1. ✨ 스토어 임포트
import Chart from 'chart.js/auto'
import { Client } from '@stomp/stompjs'

const boardStore = useBoardStore()

// 2. ✨ 로컬 상태 대신 스토어 데이터 참조
const voteStatus = computed(() => boardStore.currentVoteSession)
const isLoading = computed(() => boardStore.isLoading)

let chartInstance = null
let client = null

const hasVotes = computed(() => {
  if (!voteStatus.value?.options) return false
  return voteStatus.value.options.some(o => o.count > 0)
})

// --- WebSocket 연결 로직 (실시간 차트 반영) ---
const connectWebSocket = () => {
  if (!voteStatus.value?.id || client) return

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const socketURL = baseURL.replace(/^http/, 'ws') + '/ws-galdcup'

  client = new Client({
    brokerURL: socketURL,
    onConnect: () => {
      client.subscribe(`/topic/votes/${voteStatus.value.id}`, (message) => {
        const countsMap = JSON.parse(message.body)
        
        // 스토어 데이터 업데이트 (반응형)
        voteStatus.value.options.forEach((opt, index) => {
          if (countsMap[index] !== undefined) {
            opt.count = countsMap[index]
          }
        })

        // 차트 실시간 업데이트
        if (chartInstance) {
          chartInstance.data.datasets[0].data = voteStatus.value.options.map(o => o.count)
          chartInstance.update('none') 
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
  if (!canvas || chartInstance) return
  
  const ctx = canvas.getContext('2d')

  // 이미지 패턴 생성 (CLOB/URL 최적화)
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
      datasets: [{
        data: voteStatus.value.options.map(o => o.count),
        backgroundColor: patterns,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
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

// 3. ✨ 데이터 감시 및 초기화
// BoardLayout에서 데이터를 다 가져왔거나, 가져오는 중일 때 대응
watch(voteStatus, async (newVal) => {
  if (newVal && hasVotes.value) {
    await initChart()
    connectWebSocket()
  }
}, { immediate: true })

onMounted(() => {
  // onMounted 시점에 이미 데이터가 있다면 차트 초기화 시도
  if (voteStatus.value && hasVotes.value) {
    initChart()
    connectWebSocket()
  }
})

onUnmounted(() => {
  if (client) client.deactivate()
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// 퍼센트 계산 로직 (기존 유지)
const calculatePercentage = (count) => {
  if (!voteStatus.value?.options) return 0
  const total = voteStatus.value.options.reduce((acc, cur) => acc + Number(cur.count || 0), 0)
  return total === 0 ? 0 : (Number(count || 0) / total) * 100
}
</script>