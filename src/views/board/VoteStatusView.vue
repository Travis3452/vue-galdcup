<template>
  <div class="min-h-screen bg-indigo-50 flex justify-center py-12">
    <div class="w-[90%] max-w-3xl bg-white border-2 border-gray-200 rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-extrabold text-indigo-700 text-center mb-6">⚔️ 투표 현황</h2>

      <!-- Pie Chart -->
      <div class="flex justify-center mb-8">
        <canvas id="votePieChart" width="300" height="300"></canvas>
      </div>

      <!-- 투표가 없을 때 메시지 -->
      <div v-if="!hasVotes" class="text-center text-gray-500">
        아직 투표가 없습니다.
      </div>

      <!-- 옵션별 이미지 + 라벨 + 투표수 -->
      <div v-else class="grid grid-cols-2 gap-6">
        <div
          v-for="opt in voteStatus?.options"
          :key="opt.label"
          class="flex items-center gap-4 bg-indigo-50 rounded-lg p-4 border border-gray-200"
        >
          <img
            :src="opt.imageUrl || 'https://via.placeholder.com/80'"
            class="w-16 h-16 object-cover rounded border"
          />
          <div>
            <p class="font-semibold text-gray-800">{{ opt.label }}</p>
            <p class="text-sm text-gray-600">{{ opt.count }}표</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import Chart from 'chart.js/auto'

const route = useRoute()
const voteStatus = ref(null)

const hasVotes = computed(() => {
  if (!voteStatus.value?.options) return false
  return voteStatus.value.options.some(o => o.count > 0)
})

onMounted(async () => {
  const res = await api.get(`/boards/${route.params.boardId}/vote-session`)
  voteStatus.value = res.data

  await nextTick()

  if (hasVotes.value) {
    const ctx = document.getElementById('votePieChart').getContext('2d')

    // 이미지 로드 후 패턴 생성
    const images = await Promise.all(
      voteStatus.value.options.map(opt => {
        return new Promise(resolve => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = opt.imageUrl || 'https://via.placeholder.com/80'
          img.onload = () => resolve(img)
        })
      })
    )

    const patterns = images.map(img => ctx.createPattern(img, 'repeat'))

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: voteStatus.value.options.map(o => o.label),
        datasets: [
          {
            data: voteStatus.value.options.map(o => o.count),
            backgroundColor: patterns // ✅ 이미지 패턴으로 채우기
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        }
      }
    })
  }
})
</script>
