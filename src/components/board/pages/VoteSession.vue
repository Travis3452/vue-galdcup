<template>
  <div class="vote-session-wrapper">
    
    <div v-if="voteSession" class="px-6 py-8 border-2 border-gray-100 rounded-xl bg-yellow-50 text-center shadow-sm">
      <h2 class="text-xl font-bold text-indigo-700 mb-2">⚔️ 진행 중인 투표</h2>
      <p class="text-xs text-gray-500 mb-6 font-medium">
        기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
      </p>

      <div class="flex items-center justify-center gap-8 mb-8" 
           :class="voteSession.options?.length === 2 ? 'flex-row' : 'flex-wrap'">
        
        <template v-for="(opt, idx) in voteSession.options" :key="idx">
          <div class="flex flex-col items-center group">
            <div class="relative overflow-hidden rounded-lg border-2 border-white shadow-md mb-3 w-36 h-36 bg-white">
              <img :src="opt.imageUrl || 'https://via.placeholder.com/150'"
                   :alt="opt.label"
                   class="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
              <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 font-bold">
                현재 {{ opt.count }}표
              </div>
            </div>
            <span class="text-gray-800 font-bold text-sm">{{ opt.label }}</span>
            
              <div class="bg-indigo-500 h-full transition-all duration-700"
                   :style="{ width: calculatePercentage(opt.count) + '%' }"></div>
          </div>
          
          <div v-if="idx < (voteSession.options?.length || 0) - 1" 
               class="text-3xl font-black text-red-600 italic animate-pulse mx-2">VS</div>
        </template>
      </div>

      <div class="flex justify-center gap-4">
        <button
          @click="onVoteClick"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg font-bold text-sm"
        >
          투표 참여하기
        </button>
        <button
          @click="openVoteStatusWindow"
          class="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-lg font-bold text-sm"
        >
          현황 보기
        </button>
      </div>
    </div>

    <div v-else class="px-6 py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center text-sm text-gray-400 italic">
      현재 진행 중인 투표 세션이 없습니다.
    </div>

    <div v-if="isManager" class="admin-zone mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-2">
        <span class="flex h-2 w-2 rounded-full bg-indigo-500"></span>
        <h4 class="text-sm font-bold text-indigo-900">게시판 관리 도구</h4>
      </div>
      <div class="flex gap-2">
        <button 
          v-if="!voteSession" 
          @click="handleCreateVote"
          class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-md hover:bg-indigo-700 transition"
        >
          새 투표 생성
        </button>
        <button 
          v-if="voteSession && !voteSession.isFinished" 
          @click="handleFinishVote"
          class="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded shadow-md hover:bg-red-600 transition"
        >
          투표 즉시 마감
        </button>
      </div>
    </div>
  </div>
</template>

<script src="../scripts/VoteSession.js"></script>