<template>
  <div class="max-w-2xl mx-auto bg-white shadow rounded-lg p-10 space-y-12">
    <!-- 투표 주제 영역 -->
    <div class="bg-indigo-50 rounded-lg p-6 space-y-4">
      <h3 class="text-xl font-bold text-indigo-700">📝 투표 주제</h3>
      <input
        :value="boardTitle"
        type="text"
        class="w-full border rounded px-4 py-3 bg-gray-100 text-gray-700 cursor-not-allowed"
        readonly
      />
    </div>

    <!-- 투표 선택지 영역 -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h3 class="text-xl font-bold text-indigo-700 mb-6">📌 투표 선택지</h3>

      <div class="space-y-6 w-full">
        <div
          v-for="(opt, idx) in options"
          :key="idx"
          class="flex items-center gap-4 w-full"
        >
          <span class="w-8 text-right text-gray-600 font-semibold mr-4">{{ idx + 1 }}.</span>
          <input
            v-model="options[idx]"
            type="text"
            class="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="선택지를 입력하세요"
          />
          <div class="flex flex-col items-center">
            <input type="file" accept="image/*" @change="onImageUpload($event, idx)" />
            <img
              v-if="optionImages[idx]"
              :src="optionImages[idx]"
              alt="선택지 이미지"
              class="w-16 h-16 object-cover rounded mt-2 border"
            />
          </div>
        </div>

        <div class="w-full flex justify-end gap-4">
          <button
            type="button"
            @click="addOption"
            class="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
          >
            추가
          </button>
          <button
            type="button"
            @click="removeOption(options.length - 1)"
            class="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
            v-if="options.length > 2"
          >
            삭제
          </button>
        </div>
      </div>
    </div>

    <!-- 투표 기간 영역 -->
    <div class="bg-gray-50 rounded-lg p-6 space-y-6">
      <h3 class="text-xl font-bold text-indigo-700">⏱ 투표 기간</h3>
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">시작 시간</label>
          <input
            v-model="startTime"
            type="datetime-local"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">종료 시간</label>
          <input
            v-model="endTime"
            type="datetime-local"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- 제출 버튼 -->
    <button
      type="submit"
      @click.prevent="createVoteSession"
      class="w-full bg-indigo-600 text-white py-4 rounded font-semibold hover:bg-indigo-700 transition"
    >
      대결 생성하기
    </button>
  </div>
</template>

<script setup>
import useCreateVoteSession from '@/pages/scripts/CreateVoteSession.js'

const {
  boardTitle,
  startTime,
  endTime,
  options,
  optionImages,
  addOption,
  removeOption,
  onImageUpload,
  createVoteSession
} = useCreateVoteSession()
</script>